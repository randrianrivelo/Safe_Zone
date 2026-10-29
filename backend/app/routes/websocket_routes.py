from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import List, Dict
import json
from datetime import datetime
from app.utils.logger import logger

router = APIRouter(tags=["WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connecté - Utilisateur {user_id}")

        # Envoyer un message de bienvenue
        await self.send_personal_message({
            "type": "connection",
            "status": "connected",
            "message": "Connecté au serveur de notifications",
            "timestamp": datetime.now().isoformat()
        }, user_id)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket déconnecté - Utilisateur {user_id}")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Erreur envoi message à {user_id}: {e}")

    async def broadcast(self, message: dict):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Erreur broadcast à {user_id}: {e}")

    async def send_alert_to_all(self, title: str, message: str, severity: str = "info"):
        """Envoyer une alerte à tous les utilisateurs connectés"""
        alert_data = {
            "type": "alert",
            "title": title,
            "message": message,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(alert_data)
        logger.info(f"Alerte diffusée à tous: {title}")

    async def send_alert_to_user(self, user_id: int, title: str, message: str, severity: str = "info"):
        """Envoyer une alerte à un utilisateur spécifique"""
        alert_data = {
            "type": "alert",
            "title": title,
            "message": message,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_personal_message(alert_data, user_id)
        logger.info(f"Alerte envoyée à l'utilisateur {user_id}: {title}")

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type", "unknown")

                if msg_type == "ping":
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }, user_id)

                elif msg_type == "alert":
                    # Seul l'admin peut envoyer des alertes à tous
                    await manager.send_alert_to_all(
                        title=message.get("title", "Alerte"),
                        message=message.get("message", ""),
                        severity=message.get("severity", "info")
                    )

                elif msg_type == "test":
                    await manager.send_personal_message({
                        "type": "test",
                        "message": "Test réussi!",
                        "timestamp": datetime.now().isoformat()
                    }, user_id)

                logger.info(f"Message WebSocket reçu de {user_id}: {msg_type}")

            except json.JSONDecodeError:
                logger.warning(f"Message JSON invalide: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

    except Exception as e:
        logger.error(f"Erreur WebSocket: {e}")
        manager.disconnect(websocket, user_id)

# Fonctions pour envoyer des alertes depuis d'autres parties de l'application
async def send_alert_to_all(title: str, message: str, severity: str = "info"):
    await manager.send_alert_to_all(title, message, severity)

async def send_alert_to_user(user_id: int, title: str, message: str, severity: str = "info"):
    await manager.send_alert_to_user(user_id, title, message, severity)

async def get_connection_count() -> int:
    return sum(len(conns) for conns in manager.active_connections.values())