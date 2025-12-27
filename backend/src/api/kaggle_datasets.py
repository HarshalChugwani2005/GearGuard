import kagglehub


def download_industrial_equipment_dataset() -> str:
    """Download the industrial equipment monitoring dataset and return the local path."""
    path = kagglehub.dataset_download("dnkumars/industrial-equipment-monitoring-dataset")
    print("Path to industrial equipment dataset:", path)
    return path


def download_predictive_maintenance_dataset() -> str:
    """Download the predictive maintenance dataset and return the local path."""
    path = kagglehub.dataset_download("stratographics/predictive-maintenance-equipment-dataset-for-ml")
    print("Path to predictive maintenance dataset:", path)
    return path
