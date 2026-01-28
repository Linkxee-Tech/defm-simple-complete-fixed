from sqlalchemy.orm import Session
from app.models.models import Report, Case, Evidence
from typing import Optional
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import os
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class ReportService:
    """Service for generating reports."""
    
    def __init__(self, db: Session):
        self.db = db
        self.reports_dir = "./reports"
        os.makedirs(self.reports_dir, exist_ok=True)
    
    async def generate_case_report(
        self,
        case_id: int,
        report_type: str = "summary",
        generated_by: int = None
    ) -> Report:
        """
        Generate a PDF report for a case.
        
        Args:
            case_id: ID of the case
            report_type: Type of report (summary, detailed, forensic)
            generated_by: User ID generating the report
            
        Returns:
            Report object
        """
        try:
            # Get case data
            case = self.db.query(Case).filter(Case.id == case_id).first()
            if not case:
                raise ValueError(f"Case {case_id} not found")
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"case_{case.case_number}_{report_type}_{timestamp}.pdf"
            filepath = os.path.join(self.reports_dir, filename)
            
            # Create PDF
            doc = SimpleDocTemplate(filepath, pagesize=letter)
            story = []
            styles = getSampleStyleSheet()
            
            # Title
            title = Paragraph(
                f"<b>Case Report: {case.case_number}</b>",
                styles['Title']
            )
            story.append(title)
            story.append(Spacer(1, 12))
            
            # Case details
            case_data = [
                ["Case Number:", case.case_number],
                ["Title:", case.title],
                ["Status:", case.status.value],
                ["Priority:", case.priority.value],
                ["Created:", case.created_at.strftime("%Y-%m-%d %H:%M:%S")],
                ["Description:", case.description or "N/A"],
            ]
            
            case_table = Table(case_data, colWidths=[150, 350])
            case_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(case_table)
            story.append(Spacer(1, 20))
            
            # Evidence summary
            evidence_items = self.db.query(Evidence).filter(
                Evidence.case_id == case_id
            ).all()
            
            if evidence_items:
                story.append(Paragraph("<b>Evidence Items:</b>", styles['Heading2']))
                story.append(Spacer(1, 12))
                
                evidence_data = [["#", "Evidence Number", "Type", "Status"]]
                for idx, item in enumerate(evidence_items, 1):
                    evidence_data.append([
                        str(idx),
                        item.evidence_number,
                        item.evidence_type.value,
                        item.status.value
                    ])
                
                evidence_table = Table(evidence_data, colWidths=[30, 150, 150, 150])
                evidence_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                
                story.append(evidence_table)
            
            # Build PDF
            doc.build(story)
            
            # Create report record
            report = Report(
                case_id=case_id,
                title=f"{report_type.title()} Report - {case.case_number}",
                content=f"Generated {report_type} report for case {case.case_number}",
                generated_by=generated_by,
                report_type=report_type,
                file_path=filepath,
                generated_at=datetime.utcnow()
            )
            
            self.db.add(report)
            self.db.commit()
            self.db.refresh(report)
            
            logger.info(f"Report generated: {filepath}")
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate report: {str(e)}")
            self.db.rollback()
            raise
    
    def get_report(self, report_id: int) -> Optional[Report]:
        """Get a report by ID."""
        return self.db.query(Report).filter(Report.id == report_id).first()
    
    def list_reports(
        self,
        case_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ):
        """List reports with optional filtering."""
        query = self.db.query(Report)
        
        if case_id:
            query = query.filter(Report.case_id == case_id)
        
        return query.order_by(Report.generated_at.desc()).offset(skip).limit(limit).all()
