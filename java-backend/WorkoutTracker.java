import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages all logged workouts for a specific user, in memory.
 * Each user should have their own WorkoutTracker instance.
 *
 * Tracks everything the Level Up Fitness dashboard needs:
 * - Full workout history
 * - Total/average stats (calories, duration, volume)
 * - XP earned (feeds into levels and ranks)
 * - Streaks (how many days in a row the user worked out)
 */
public class WorkoutTracker {

    private String userId;                          // This tracker belongs to one user
    private List<Workout> workoutLog = new ArrayList<>();

    // Constructor requires a userId — a tracker without a user makes no sense
    public WorkoutTracker(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId cannot be empty");
        }
        this.userId = userId;
    }

    // -------------------------
    // Logging
    // -------------------------

    // Add a workout — but only if it belongs to this user
    public void logWorkout(Workout workout) {
        if (!workout.getUserId().equals(userId)) {
            throw new IllegalArgumentException("This workout belongs to a different user");
        }
        workoutLog.add(workout);
        System.out.println("✅ Logged: " + workout);
    }

    // Remove a workout by its ID (for the delete feature)
    public boolean deleteWorkout(String workoutId) {
        boolean removed = workoutLog.removeIf(w -> w.getId().equals(workoutId));
        if (removed) {
            System.out.println("🗑️  Workout " + workoutId + " deleted.");
        } else {
            System.out.println("⚠️  Workout not found: " + workoutId);
        }
        return removed;
    }

    // -------------------------
    // History & Filtering
    // -------------------------

    public List<Workout> getAllWorkouts() {
        return workoutLog;
    }

    // Filter by workout type (e.g. show only CARDIO sessions)
    public List<Workout> getByType(Workout.WorkoutType type) {
        return workoutLog.stream()
                .filter(w -> w.getWorkoutType() == type)
                .collect(Collectors.toList());
    }

    // Filter by date range (e.g. this week's workouts)
    public List<Workout> getByDateRange(LocalDate from, LocalDate to) {
        return workoutLog.stream()
                .filter(w -> !w.getDate().isBefore(from) && !w.getDate().isAfter(to))
                .collect(Collectors.toList());
    }

    // Find a specific workout by ID (for editing notes, etc.)
    public Workout findById(String workoutId) {
        return workoutLog.stream()
                .filter(w -> w.getId().equals(workoutId))
                .findFirst()
                .orElse(null);  // Returns null if not found
    }

    public void printHistory() {
        if (workoutLog.isEmpty()) {
            System.out.println("No workouts logged yet.");
            return;
        }
        System.out.println("--- Workout History for user: " + userId + " ---");
        for (Workout w : workoutLog) {
            System.out.println(w);
        }
    }

    // -------------------------
    // Progress Stats (for the dashboard)
    // -------------------------

    public int getTotalMinutes() {
        int total = 0;
        for (Workout w : workoutLog) total += w.getDurationMinutes();
        return total;
    }

    public int getTotalCalories() {
        int total = 0;
        for (Workout w : workoutLog) total += w.getCaloriesBurned();
        return total;
    }

    // Total XP earned across all workouts — feeds into the level/rank system
    public int getTotalXP() {
        int total = 0;
        for (Workout w : workoutLog) total += w.getXpEarned();
        return total;
    }

    // Total volume lifted across all STRENGTH workouts
    public double getTotalVolume() {
        double total = 0;
        for (Workout w : workoutLog) total += w.getVolume();
        return total;
    }

    public double getAverageDuration() {
        if (workoutLog.isEmpty()) return 0;
        return (double) getTotalMinutes() / workoutLog.size();
    }

    public int getTotalWorkouts() {
        return workoutLog.size();
    }

    // -------------------------
    // Streak Tracking
    // Counts how many days in a row the user has logged at least one workout
    // -------------------------
    public int getCurrentStreak() {
        if (workoutLog.isEmpty()) return 0;

        LocalDate today = LocalDate.now();
        int streak = 0;
        LocalDate checkDate = today;

        while (true) {
            final LocalDate dateToCheck = checkDate;
            boolean workedOutOnDay = workoutLog.stream()
                    .anyMatch(w -> w.getDate().equals(dateToCheck));

            if (workedOutOnDay) {
                streak++;
                checkDate = checkDate.minusDays(1);  // Go back one day and check again
            } else {
                break;  // Streak is broken
            }
        }
        return streak;
    }

    // -------------------------
    // Summary (what the dashboard would display)
    // -------------------------
    public void printSummary() {
        System.out.println("=== Progress Summary for " + userId + " ===");
        System.out.println("Total workouts : " + getTotalWorkouts());
        System.out.println("Total minutes  : " + getTotalMinutes());
        System.out.println("Total calories : " + getTotalCalories());
        System.out.println("Total XP earned: " + getTotalXP());
        System.out.println("Total volume   : " + getTotalVolume() + " kg");
        System.out.println("Avg duration   : " + String.format("%.1f", getAverageDuration()) + " min");
        System.out.println("Current streak : " + getCurrentStreak() + " day(s)");
    }
}
