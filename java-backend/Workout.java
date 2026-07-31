import java.time.LocalDate;
import java.util.UUID;

/**
 * Represents a single logged workout session.
 *
 * Designed to match the Level Up Fitness app's needs:
 * - Tied to a specific user (userId)
 * - Tracks both cardio AND strength data (volume = sets x reps x weight)
 * - Awards XP so the dashboard can update levels/ranks
 * - Has an ID so it can be stored, retrieved, or deleted from a database later
 */
public class Workout {

    // -------------------------
    // Workout types the app supports
    // An "enum" is a fixed set of allowed values — safer than using plain strings
    // -------------------------
    public enum WorkoutType {
        STRENGTH,   // e.g. bench press, squats
        CARDIO,     // e.g. running, cycling
        FLEXIBILITY // e.g. yoga, stretching
    }

    // -------------------------
    // Fields
    // -------------------------
    private String id;              // Unique ID for this workout (for DB use later)
    private String userId;          // Which user logged this workout
    private String exerciseName;
    private WorkoutType workoutType;
    private int durationMinutes;
    private int caloriesBurned;

    // Strength-specific fields (ignored for cardio/flexibility)
    private int sets;
    private int reps;
    private double weightKg;        // volume = sets x reps x weightKg

    private String notes;           // Optional — user can describe their session
    private LocalDate date;
    private int xpEarned;           // XP to award to the user after logging

    // -------------------------
    // Constructor
    // -------------------------
    public Workout(String userId, String exerciseName, WorkoutType workoutType,
                   int durationMinutes, int caloriesBurned, LocalDate date) {

        // Validation — catch bad data before it causes problems later
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId cannot be empty");
        }
        if (exerciseName == null || exerciseName.isBlank()) {
            throw new IllegalArgumentException("Exercise name cannot be empty");
        }
        if (durationMinutes <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }
        if (caloriesBurned < 0) {
            throw new IllegalArgumentException("Calories cannot be negative");
        }

        this.id = UUID.randomUUID().toString(); // Auto-generate a unique ID
        this.userId = userId;
        this.exerciseName = exerciseName;
        this.workoutType = workoutType;
        this.durationMinutes = durationMinutes;
        this.caloriesBurned = caloriesBurned;
        this.date = (date != null) ? date : LocalDate.now();
        this.xpEarned = calculateXP();  // Auto-calculate XP on creation
    }

    // -------------------------
    // XP Calculation
    // Gives the dashboard something to work with for leveling up
    // Formula: base 10 XP + 1 per minute + 1 per 10 calories
    // -------------------------
    private int calculateXP() {
        return 10 + durationMinutes + (caloriesBurned / 10);
    }

    // -------------------------
    // Volume (for strength workouts)
    // Volume = total weight moved across all sets and reps
    // -------------------------
    public double getVolume() {
        if (workoutType != WorkoutType.STRENGTH) return 0;
        return sets * reps * weightKg;
    }

    // Lets you set strength details after construction
    public void setStrengthDetails(int sets, int reps, double weightKg) {
        if (workoutType != WorkoutType.STRENGTH) {
            throw new IllegalStateException("Strength details only apply to STRENGTH workouts");
        }
        if (sets <= 0 || reps <= 0 || weightKg < 0) {
            throw new IllegalArgumentException("Sets and reps must be > 0, weight must be >= 0");
        }
        this.sets = sets;
        this.reps = reps;
        this.weightKg = weightKg;
    }

    // -------------------------
    // Getters
    // -------------------------
    public String getId()               { return id; }
    public String getUserId()           { return userId; }
    public String getExerciseName()     { return exerciseName; }
    public WorkoutType getWorkoutType() { return workoutType; }
    public int getDurationMinutes()     { return durationMinutes; }
    public int getCaloriesBurned()      { return caloriesBurned; }
    public int getSets()                { return sets; }
    public int getReps()                { return reps; }
    public double getWeightKg()         { return weightKg; }
    public String getNotes()            { return notes; }
    public LocalDate getDate()          { return date; }
    public int getXpEarned()            { return xpEarned; }

    // Setter only for notes (the only field a user might want to edit after logging)
    public void setNotes(String notes)  { this.notes = notes; }

    // -------------------------
    // toString — what gets printed when you System.out.println(workout)
    // -------------------------
    @Override
    public String toString() {
        String base = String.format("[%s] %s | %s | %d min | %d cal | +%d XP | %s",
                id.substring(0, 8),  // Just show the first 8 chars of the ID
                date, exerciseName, durationMinutes, caloriesBurned, xpEarned, workoutType);

        if (workoutType == WorkoutType.STRENGTH) {
            base += String.format(" | %d sets x %d reps x %.1f kg (vol: %.1f kg)", 
                    sets, reps, weightKg, getVolume());
        }
        if (notes != null && !notes.isBlank()) {
            base += " | Notes: " + notes;
        }
        return base;
    }
}
