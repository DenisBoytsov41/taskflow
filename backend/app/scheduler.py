from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.utils.notifier import notify_users_about_expiring_tasks

def start_scheduler():
    scheduler = BackgroundScheduler()

    def run_notifications():
        db = SessionLocal()
        try:
            notify_users_about_expiring_tasks(db)
        finally:
            db.close()

    scheduler.add_job(run_notifications, "interval", minutes=1)
    scheduler.start()
