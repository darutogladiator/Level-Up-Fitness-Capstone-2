const avatarSymbols = [
    "⚔",
    "🔥",
    "⚡",
    "🛡",
    "💪",
    "initials"
];

let selectedAvatarSymbol = "⚔";

document.addEventListener("DOMContentLoaded", () => {
    const saveButton =
        document.getElementById("saveProfile");

    const avatarPreview =
        document.getElementById("avatarPreview");

    const symbolInput =
        document.getElementById("avatarSymbolInput");

    const initialsInput =
        document.getElementById("avatarInitialsInput");

    const shapeInput =
        document.getElementById("avatarShapeInput");

    if (!saveButton) {
        return;
    }

    populateProfileForm();
    updateAvatarPreview();

    saveButton.addEventListener(
        "click",
        saveProfilePreferences
    );

    symbolInput?.addEventListener("change", () => {
        selectedAvatarSymbol = symbolInput.value;
        updateAvatarPreview();
    });

    initialsInput?.addEventListener("input", () => {
        initialsInput.value = initialsInput.value
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 2)
            .toUpperCase();

        updateAvatarPreview();
    });

    shapeInput?.addEventListener(
        "change",
        updateAvatarPreview
    );

    avatarPreview?.addEventListener(
        "click",
        cycleAvatarSymbol
    );
});

function populateProfileForm() {
    setInputValue(
        "profileNameInput",
        state.profile.name
    );

    setInputValue(
        "goalInput",
        state.profile.goal
    );

    setInputValue(
        "accentInput",
        state.profile.accent
    );

    setInputValue(
        "experienceInput",
        state.profile.experience
    );

    setInputValue(
        "workoutTypeInput",
        state.profile.workoutType
    );

    setInputValue(
        "workoutDaysInput",
        state.profile.workoutDays
    );

    setInputValue(
        "equipmentInput",
        state.profile.equipment
    );

    const avatar = state.profile.avatar || {
        symbol: "⚔",
        initials: "HU",
        shape: "circle"
    };

    selectedAvatarSymbol =avatar.symbol || "⚔";

    setInputValue(
        "avatarSymbolInput",
        selectedAvatarSymbol
    );

    setInputValue(
        "avatarInitialsInput",
        avatar.initials ||
        getInitials(state.profile.name)
    );

    setInputValue(
        "avatarShapeInput",
        avatar.shape || "circle"
    );
}

function saveProfilePreferences() {
    const profileNameInput = document.getElementById("profileNameInput");

    const initialsInput = document.getElementById("avatarInitialsInput");

    const symbolInput = document.getElementById("avatarSymbolInput");

    const shapeInput = document.getElementById("avatarShapeInput");

    if (
        !profileNameInput ||
        !initialsInput ||
        !symbolInput ||
        !shapeInput
    ) {
        return;
    }

    const profileName = profileNameInput.value.trim() || "Hunter";

    state.profile.name = profileName;

    state.profile.goal = document.getElementById("goalInput").value;

    state.profile.accent = document.getElementById("accentInput").value;

    state.profile.experience = document.getElementById("experienceInput").value;

    state.profile.workoutType = document.getElementById("workoutTypeInput").value;

    state.profile.workoutDays =document.getElementById("workoutDaysInput").value;

    state.profile.equipment = document.getElementById("equipmentInput").value;

    selectedAvatarSymbol = symbolInput.value;

    state.profile.avatar = {
        symbol: symbolInput.value,

        initials:
            initialsInput.value.trim().toUpperCase() ||
            getInitials(profileName),

        shape: shapeInput.value
    };

    saveState();
    applyAccent();
    renderShared();
    updateAvatarPreview();

    showToast(
        "Profile Updated",
        `${state.profile.name}'s avatar and preferences saved.`
    );
}

function updateAvatarPreview() {
    const preview =document.getElementById("avatarPreview");

    const symbolInput =document.getElementById("avatarSymbolInput");

    const initialsInput =
        document.getElementById("avatarInitialsInput");

    const shapeInput =
        document.getElementById("avatarShapeInput");

    const profileNameInput =
        document.getElementById("profileNameInput");

    if (
        !preview ||
        !symbolInput ||
        !initialsInput ||
        !shapeInput
    ) {
        return;
    }

    // Always get the newest dropdown value.
    selectedAvatarSymbol = symbolInput.value;

    const initials =
        initialsInput.value.trim().toUpperCase() ||
        getInitials(profileNameInput?.value);

    if (selectedAvatarSymbol === "initials") {
        preview.textContent = initials;
    } else {
        preview.textContent = selectedAvatarSymbol;
    }

    preview.classList.remove(
        "avatar-circle",
        "avatar-square",
        "avatar-hexagon"
    );

    preview.classList.add(
        `avatar-${shapeInput.value}`
    );
}

function cycleAvatarSymbol() {
    const symbolInput =
        document.getElementById("avatarSymbolInput");

    if (!symbolInput) {
        return;
    }

    const currentIndex =
        avatarSymbols.indexOf(symbolInput.value);

    const nextIndex =
        (currentIndex + 1) % avatarSymbols.length;

    symbolInput.value =
        avatarSymbols[nextIndex];

    selectedAvatarSymbol =
        symbolInput.value;

    updateAvatarPreview();
}

function getInitials(name) {
    const cleanName =
        String(name || "Hunter").trim();

    if (!cleanName) {
        return "HU";
    }

    const words =
        cleanName.split(/\s+/);

    if (words.length === 1) {
        return words[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}

function setInputValue(id, value) {
    const input =
        document.getElementById(id);

    if (
        input &&
        value !== undefined
    ) {
        input.value = value;
    }
}