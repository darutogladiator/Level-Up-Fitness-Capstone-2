import java.time.LocalDate;

/**
 * Demo class — simulates what the real app would do when a user logs workouts.
 * In the actual app, this logic would be triggered by API calls or UI button clicks,
 * not run from a main method. But this lets you test everything works correctly.
 */
public class Main {
    public static void main(String[] args) {

        // Simulate a real user with an ID (in the real app this comes from authentication)
        String userId = "user-001";
        WorkoutTracker tracker = new WorkoutTracker(userId);

        // --- Log a cardio workout ---
        Workout run = new Workout(userId, "Running", Workout.WorkoutType.CARDIO, 30, 300, LocalDate.now());
        run.setNotes("Morning jog, felt great");
        tracker.logWorkout(run);

        // --- Log a strength workout ---
        Workout bench = new Workout(userId, "Bench Press", Workout.WorkoutType.STRENGTH, 45, 200, LocalDate.now());
        bench.setStrengthDetails(4, 10, 60.0);  // 4 sets, 10 reps, 60kg
        tracker.logWorkout(bench);

        // --- Log a workout from yesterday (for streak testing) ---
        Workout yoga = new Workout(userId, "Yoga", Workout.WorkoutType.FLEXIBILITY, 20, 80,
                LocalDate.now().minusDays(1));
        tracker.logWorkout(yoga);

        // --- Show full history ---
        System.out.println();
        tracker.printHistory();

        // --- Show dashboard summary ---
        System.out.println();
        tracker.printSummary();

        // --- Demo: find a workout and edit its notes ---
        System.out.println();
        System.out.println("--- Editing notes on the bench press workout ---");
        Workout found = tracker.findById(bench.getId());
        if (found != null) {
            found.setNotes("Increased weight from last time!");
            System.out.println("Updated: " + found);
        }

        // --- Demo: delete a workout ---
        System.out.println();
        System.out.println("--- Deleting the yoga workout ---");
        tracker.deleteWorkout(yoga.getId());
        System.out.println("Workouts remaining: " + tracker.getTotalWorkouts());

        // --- Demo: filter by type ---
        System.out.println();
        System.out.println("--- Cardio sessions only ---");
        for (Workout w : tracker.getByType(Workout.WorkoutType.CARDIO)) {
            System.out.println(w);
        }
    }
}
