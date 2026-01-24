from sqlalchemy.orm import Session
from app.models.models import Case, Evidence, ChainOfCustody, User
from app.schemas.schemas import User as UserSchema
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from datetime import datetime
from reportlab.pdfgen import canvas
from io import BytesIO
import os
import logging

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    async def generate_pdf_report(
        self,
        case: Case,
        report_type: str = "summary",
        include_evidence: bool = True,
        include_custody: bool = True,
        generated_by: UserSchema = None
    ) -> str:
        """Generate PDF report for a case."""
        try:
            # Create filename
            filename = f"report_{case.case_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            file_path = os.path.join("./reports", filename)

            # Create PDF document
            doc = SimpleDocTemplate(file_path, pagesize=A4)
            styles = getSampleStyleSheet()
            story = []

            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=1  # Center alignment
            )

            story.append(Paragraph("Digital Evidence Framework Management", title_style))
            story.append(Paragraph(f"{report_type.title()} Report", title_style))
            story.append(Spacer(1, 12))

            # Case Information
            story.append(Paragraph("Case Information", styles['Heading2']))

            case_data = [
                ["Case Number:", case.case_number],
                ["Title:", case.title],
                ["Status:", case.status.value if case.status else "N/A"],
                ["Priority:", case.priority.value if case.priority else "N/A"],
                ["Created:", case.created_at.strftime("%Y-%m-%d %H:%M:%S") if case.created_at else "N/A"],
                ["Location:", case.location or "N/A"],
                ["Client:", case.client_name or "N/A"],
            ]

            # Add created by and assigned to information
            if case.created_by_user:
                case_data.append(["Created By:", case.created_by_user.full_name])
            if case.assigned_to_user:
                case_data.append(["Assigned To:", case.assigned_to_user.full_name])

            case_table = Table(case_data, colWidths=[2*inch, 4*inch])
            case_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))

            story.append(case_table)
            story.append(Spacer(1, 20))

            # Description
            if case.description:
                story.append(Paragraph("Description", styles['Heading2']))
                story.append(Paragraph(case.description, styles['Normal']))
                story.append(Spacer(1, 20))

            # Evidence Section
            if include_evidence:
                evidence_list = self.db.query(Evidence).filter(Evidence.case_id == case.id).all()

                if evidence_list:
                    story.append(Paragraph("Evidence Items", styles['Heading2']))
                    evidence_data = [["Evidence #", "Title", "Type", "Status", "Collected By", "Date"]]

                    for evidence in evidence_list:
                        collected_by = evidence.collected_by_user.full_name if evidence.collected_by_user else "Unknown"
                        collected_date = evidence.collected_at.strftime("%Y-%m-%d") if evidence.collected_at else "N/A"
                        evidence_data.append([
                            evidence.evidence_number,
                            evidence.title[:30] + "..." if len(evidence.title) > 30 else evidence.title,
                            evidence.evidence_type.value if evidence.evidence_type else "N/A",
                            evidence.status.value if evidence.status else "N/A",
                            collected_by,
                            collected_date
                        ])

                    evidence_table = Table(evidence_data)
                    evidence_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 8),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    story.append(evidence_table)
                    story.append(Spacer(1, 20))

            # Chain of Custody Section
            if include_custody:
                custody_records = (
                    self.db.query(ChainOfCustody)
                    .join(Evidence, ChainOfCustody.evidence_id == Evidence.id)
                    .filter(Evidence.case_id == case.id)
                    .order_by(ChainOfCustody.timestamp.desc())
                    .limit(20)
                    .all()
                )

                if custody_records:
                    story.append(Paragraph("Chain of Custody (Recent 20 Records)", styles['Heading2']))
                    custody_data = [["Evidence #", "Action", "Handler", "Date/Time", "Location"]]

                    for record in custody_records:
                        handler = record.handler_user.full_name if record.handler_user else "Unknown"
                        timestamp = record.timestamp.strftime("%Y-%m-%d %H:%M") if record.timestamp else "N/A"
                        custody_data.append([
                            record.evidence.evidence_number if record.evidence else "N/A",
                            record.action[:20] + "..." if len(record.action) > 20 else record.action,
                            handler,
                            timestamp,
                            record.location[:15] + "..." if record.location and len(record.location) > 15 else record.location or "N/A"
                        ])

                    custody_table = Table(custody_data)
                    custody_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 7),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    story.append(custody_table)
                    story.append(Spacer(1, 20))

            # Footer
            story.append(Spacer(1, 30))
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=1
            )
            generated_by_name = generated_by.full_name if generated_by else "System"
            footer_text = f"Report generated by {generated_by_name} on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            story.append(Paragraph(footer_text, footer_style))

            # Build PDF
            doc.build(story)
            logger.info(f"PDF report generated: {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"PDF generation error: {str(e)}")
            raise Exception(f"Failed to generate PDF report: {str(e)}")

    async def generate_text_report(
        self,
        case: Case,
        report_type: str = "summary",
        include_evidence: bool = True,
        include_custody: bool = True
    ) -> str:
        """Generate text report for a case."""
        try:
            lines = []
            lines.append("="*80)
            lines.append("DIGITAL EVIDENCE FRAMEWORK MANAGEMENT")
            lines.append(f"{report_type.upper()} REPORT")
            lines.append("="*80)
            lines.append("")

            # Case Information
            lines.append("CASE INFORMATION")
            lines.append("-"*40)
            lines.append(f"Case Number: {case.case_number}")
            lines.append(f"Title: {case.title}")
            lines.append(f"Status: {case.status.value if case.status else 'N/A'}")
            lines.append(f"Priority: {case.priority.value if case.priority else 'N/A'}")
            lines.append(f"Created: {case.created_at.strftime('%Y-%m-%d %H:%M:%S') if case.created_at else 'N/A'}")
            lines.append(f"Location: {case.location or 'N/A'}")
            lines.append(f"Client: {case.client_name or 'N/A'}")

            if case.created_by_user:
                lines.append(f"Created By: {case.created_by_user.full_name}")
            if case.assigned_to_user:
                lines.append(f"Assigned To: {case.assigned_to_user.full_name}")

            if case.description:
                lines.append(f"Description: {case.description}")

            lines.append("")

            # Evidence Section
            if include_evidence:
                evidence_list = self.db.query(Evidence).filter(Evidence.case_id == case.id).all()
                if evidence_list:
                    lines.append("EVIDENCE ITEMS")
                    lines.append("-"*40)
                    for evidence in evidence_list:
                        lines.append(f"Evidence Number: {evidence.evidence_number}")
                        lines.append(f"  Title: {evidence.title}")
                        lines.append(f"  Type: {evidence.evidence_type.value if evidence.evidence_type else 'N/A'}")
                        lines.append(f"  Status: {evidence.status.value if evidence.status else 'N/A'}")
                        if evidence.collected_by_user:
                            lines.append(f"  Collected By: {evidence.collected_by_user.full_name}")
                        lines.append(f"  Collection Date: {evidence.collected_at.strftime('%Y-%m-%d %H:%M:%S') if evidence.collected_at else 'N/A'}")
                        if evidence.description:
                            lines.append(f"  Description: {evidence.description}")
                        lines.append("")

            # Chain of Custody Section
            if include_custody:
                custody_records = (
                    self.db.query(ChainOfCustody)
                    .join(Evidence, ChainOfCustody.evidence_id == Evidence.id)
                    .filter(Evidence.case_id == case.id)
                    .order_by(ChainOfCustody.timestamp.desc())
                    .limit(50)
                    .all()
                )
                if custody_records:
                    lines.append("CHAIN OF CUSTODY")
                    lines.append("-"*40)
                    for record in custody_records:
                        lines.append(f"Evidence: {record.evidence.evidence_number if record.evidence else 'N/A'}")
                        lines.append(f"  Action: {record.action}")
                        lines.append(f"  Handler: {record.handler_user.full_name if record.handler_user else 'Unknown'}")
                        lines.append(f"  Date/Time: {record.timestamp.strftime('%Y-%m-%d %H:%M:%S') if record.timestamp else 'N/A'}")
                        lines.append(f"  Location: {record.location or 'N/A'}")
                        if record.notes:
                            lines.append(f"  Notes: {record.notes}")
                        lines.append("")

            # Footer
            lines.append("="*80)
            lines.append(f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            lines.append("Digital Evidence Framework Management System")
            lines.append("="*80)

            return "\n".join(lines)

        except Exception as e:
            logger.error(f"Text report generation error: {str(e)}")
            raise Exception(f"Failed to generate text report: {str(e)}")


# Optional simple PDF generator outside class
def generate_pdf(case_number: str):
    try:
        buffer = BytesIO()
        c = canvas.Canvas(buffer)
        c.drawString(100, 750, f"Case Report: {case_number}")
        c.save()
        buffer.seek(0)
        return buffer
    except Exception as e:
        logger.error(f"PDF generation error: {str(e)}")
        raise Exception(f"Failed to generate PDF: {str(e)}")
