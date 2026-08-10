from project.Repository.WeightLogRepo import WeightLogRepo
from project.Models.WeightLog import WeightLog


class WeightLogService:
    def __init__(self):
        self.__repo = WeightLogRepo()

    def logWeight(self, user_id, date, weight_kg):
        """Create or update weight entry for a given date."""
        existing = self.__repo.findByUserIdAndDate(user_id, date)
        if existing:
            self.__repo.update(existing.getId(), weight_kg)
            print(f"Updated weight for user {user_id} on {date}: {weight_kg} kg")
        else:
            entry = WeightLog(user_id=user_id, date=date, weight_kg=weight_kg)
            self.__repo.save(entry)
            print(f"Logged weight for user {user_id} on {date}: {weight_kg} kg")

    def getWeightHistory(self, user_id):
        """Return all weight entries sorted by date (newest first)."""
        return self.__repo.findByUserId(user_id)
