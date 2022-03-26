from .index_routes import index_bp
from .chatbot_routes import chatbot_bp

def init_app(app):
    app.register_blueprint(index_bp)
    app.register_blueprint(chatbot_bp)