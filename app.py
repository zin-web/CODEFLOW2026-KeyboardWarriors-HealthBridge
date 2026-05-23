from flask import Flask, jsonify, request, render_template
from models import db, HealthResource

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///healthbridge.db'
db.init_app(app)
with app.app_context():
    db.create_all()

#home or landing page route
@app.route('/')
def home():
    return render_template('Landing.html')
#dashboard route
@app.route('/dashboard')
def dashboard():

    return render_template('dashboard.html')
    
# Support Route
@app.route('/support')
def support():

    return render_template('support.html')

@app.route('/api/resources', methods=['GET'])
def get_resources():

    resources = HealthResource.query.all()
    return jsonify([resource.to_dict() for resource in resources]), 200
@app.route('/api/resources', methods=['POST'])
def add_resource():
    
    data = request.get_json() or {}


    required_fields = ['title', 'type', 'lat', 'lng']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        new_resource = HealthResource(
            title=data['title'],
            resource_type=data['type'],
            lat=float(data['lat']),
            lng=float(data['lng']),
            description=data.get('description', '')
        )
        
        db.session.add(new_resource)
        db.session.commit()
        
        return jsonify(new_resource.to_dict()), 201
        
    except ValueError:
        return jsonify({'error': 'Latitude and Longitude must be valid numbers'}), 400
    
if __name__ == '__main__':
    app.run(debug=True)