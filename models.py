from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class HealthResource(db.Model):
    __tablename__ = 'health_resources'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)       
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "type": self.resource_type,
            "lat": self.lat,
            "lng": self.lng,
            "description": self.description
        }
