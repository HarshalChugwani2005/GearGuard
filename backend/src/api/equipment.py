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


# TODO: Add role-based access control helper
# def check_user_permission(user_id, resource, action):
#     """Check if user has permission for action on resource"""
#     pass

# TODO: Add audit logging helper
# def log_audit_event(user_id, action, resource_type, resource_id, details=None):
#     """Log an audit event for tracking changes"""
#     pass


# =============================================================================
# ROUTES
# =============================================================================

@equipment_bp.route('/', methods=['GET'])
def get_all_equipment():
    """Get all functional equipment"""
    # TODO: Add role-based access control
    # TODO: Add audit logging for data access
    try:
        equipment = EquipmentModel.get_all_equipment()
        data = [format_equipment(eq) for eq in equipment] if equipment else []
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
    # TODO: Add role-based access control
    # TODO: Add audit logging for data access
    try:
        equipment = EquipmentModel.get_equipment_by_id(equipment_id)
        if equipment and len(equipment) > 0:
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
