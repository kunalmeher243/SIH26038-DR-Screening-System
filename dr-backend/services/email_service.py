import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_upload_notification(patient_name: str, patient_email: str, dr_label: str):
    if not resend.api_key:
        print(f"[Email Mock] Upload Notification to {patient_email} for {patient_name} - {dr_label}")
        return

    resend.Emails.send({
        "from":    "SERIX <noreply@yourdomain.com>",
        "to":      [patient_email],
        "subject": "Your retinal scan has been received — SERIX",
        "html":    f"""
            <h2>Hello {patient_name},</h2>
            <p>Your retinal image has been successfully uploaded and analysed.</p>
            <p><strong>AI Finding:</strong> {dr_label}</p>
            <p>A doctor has been assigned to your case.
               You will receive a consultation schedule shortly.</p>
            <br/>
            <p>— Team SERIX | SIH 2026</p>
        """
    })

def send_schedule_confirmation(
    patient_name:   str,
    patient_email:  str,
    phc_email:      str,
    doctor_name:    str,
    scheduled_at:   str
):
    if not resend.api_key:
        print(f"[Email Mock] Schedule Confirmation to {patient_email}, {phc_email} for {patient_name} with {doctor_name} at {scheduled_at}")
        return

    body = f"""
        <h2>Consultation Scheduled</h2>
        <p><strong>Patient:</strong> {patient_name}</p>
        <p><strong>Doctor:</strong> {doctor_name}</p>
        <p><strong>Time:</strong> {scheduled_at}</p>
        <p>Please be available at the PHC at the above time.</p>
        <br/>
        <p>— Team SERIX | SIH 2026</p>
    """
    resend.Emails.send({
        "from":    "SERIX <noreply@yourdomain.com>",
        "to":      [patient_email, phc_email],
        "subject": "Your consultation is scheduled — SERIX",
        "html":    body
    })
