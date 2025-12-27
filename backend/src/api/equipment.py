from flask import Blueprint, jsonify, request
from src.models.models import EquipmentModel, MaintenanceRequestModel

equipment_bp = Blueprint('equipment', __name__, url_prefix='/api/equipment')

# =============================================================================
# HELPER FUNCTIONS - Response Formatting
# =============================================================================

def api_response(success: bool, data=None, message: str = None, error: str = None, status_code: int = 200):
    """
    Consistent API response formatter.
    Returns: tuple(response_json, status_code)
    """
    response = {
        "success": success,
        "data": data,
        "message": message,
        "error": error
    }
    return jsonify(response), status_code


def format_equipment(eq) -> dict:
    """Format equipment tuple to dict"""
    return {
        'id': eq[0],
        'name': eq[1],
        'status': eq[2]
    }


# =============================================================================
# EQUIPMENT SAFETY CHECK HELPERS
# =============================================================================

def get_equipment_or_none(equipment_id: int):
    """
    Fetch equipment by ID and return formatted dict or None.
    """
    try:
        equipment = EquipmentModel.get_equipment_by_id(equipment_id)
        if equipment and len(equipment) > 0:
            return format_equipment(equipment[0])
        return None
    except Exception:
        return None


def is_equipment_scrapped(equipment: dict) -> bool:
    """
    Check if equipment status is SCRAP.
    """
    if not equipment:
        return False
    return equipment.get('status', '').upper() == 'SCRAP'


# =============================================================================
# ACCESS CONTROL & AUDIT HELPERS
# =============================================================================

# Role-based access control permissions mapping
ROLE_PERMISSIONS = {
    'admin': ['read', 'write', 'delete', 'manage'],
    'technician': ['read', 'write'],
    'viewer': ['read'],
}


def check_user_permission(user_id: int, resource: str, action: str) -> bool:
    """
    Check if user has permission for action on resource.
    
    Args:
        user_id: The ID of the user making the request
        resource: The resource being accessed (e.g., 'equipment', 'maintenance')
        action: The action being performed (e.g., 'read', 'write', 'delete')
    
    Returns:
        bool: True if user has permission, False otherwise
    """
    # Get user role from request headers (would typically come from auth token)
    user_role = request.headers.get('X-User-Role', 'viewer').lower()
    
    # Check if role exists and has the required permission
    if user_role not in ROLE_PERMISSIONS:
        return False
    
    allowed_actions = ROLE_PERMISSIONS.get(user_role, [])
    return action in allowed_actions


def log_audit_event(user_id: int, action: str, resource_type: str, resource_id: int, details: dict = None):
    """
    Log an audit event for tracking changes.
    
    Args:
        user_id: The ID of the user performing the action
        action: The action performed (e.g., 'read', 'create', 'update', 'delete')
        resource_type: The type of resource (e.g., 'equipment', 'maintenance_request')
        resource_id: The ID of the resource being accessed
        details: Optional additional details about the event
    """
    from datetime import datetime
    import logging
    
    audit_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id,
        'action': action,
        'resource_type': resource_type,
        'resource_id': resource_id,
        'details': details or {},
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', 'Unknown')
    }
    
    # Log to application logger (could be extended to write to database/file)
    logger = logging.getLogger('audit')
    logger.info(f"AUDIT: {audit_entry}")


# =============================================================================
# ROUTES
# =============================================================================

@equipment_bp.route('/', methods=['GET'])
def get_all_equipment():
    """Get all functional equipment"""
    # Get user ID from request headers (would typically come from auth token)
    user_id = request.headers.get('X-User-ID', 0)
    
    # Role-based access control
    if not check_user_permission(user_id, 'equipment', 'read'):
        return api_response(
            success=False,
            error='Unauthorized: Insufficient permissions to access equipment data',
            status_code=403
        )
    
    try:
        equipment = EquipmentModel.get_all_equipment()
        data = [format_equipment(eq) for eq in equipment] if equipment else []
        
        # Audit logging for data access
        log_audit_event(
            user_id=int(user_id) if user_id else 0,
            action='read',
            resource_type='equipment',
            resource_id=0,  # 0 indicates all resources
            details={'count': len(data), 'action': 'list_all'}
        )
        
        return api_response(
            success=True,
            data=data,
            message=f"Retrieved {len(data)} equipment items"
        )
    except Exception as e:
        return api_response(
            success=False,
            error=str(e),
            status_code=500
        )


@equipment_bp.route('/<int:equipment_id>', methods=['GET'])
def get_equipment(equipment_id):
    """Get equipment by ID"""
    # Get user ID from request headers (would typically come from auth token)
    user_id = request.headers.get('X-User-ID', 0)
    
    # Role-based access control
    if not check_user_permission(user_id, 'equipment', 'read'):
        return api_response(
            success=False,
            error='Unauthorized: Insufficient permissions to access equipment data',
            status_code=403
        )
    
    try:
        equipment = EquipmentModel.get_equipment_by_id(equipment_id)
        if equipment and len(equipment) > 0:
            # Audit logging for data access
            log_audit_event(
                user_id=int(user_id) if user_id else 0,
                action='read',
                resource_type='equipment',
                resource_id=equipment_id,
                details={'action': 'get_by_id'}
            )
            
            return api_response(
                success=True,
                data=format_equipment(equipment[0]),
                message="Equipment found"
            )
        return api_response(
            success=False,
            error='Equipment not found',
            status_code=404
        )
    except Exception as e:
        return api_response(
            success=False,
            error=str(e),
            status_code=500
        )
