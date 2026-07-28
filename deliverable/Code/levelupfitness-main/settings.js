document.addEventListener("DOMContentLoaded", () => {
    populateSettingsForm();

    document.getElementById("saveSettings")?.addEventListener("click", saveSettings);
    document.getElementById("resetDaily")?.addEventListener("click", resetDailyQuests);
    document.getElementById("resetAll")?.addEventListener("click", resetAllProgress);

});

function populateSettingsForm() {
    const weightUnit = document.getElementById("weightUnit");
    const distanceUnit = document.getElementById("distanceUnit");
    const notifications = document.getElementById("notificationsEnabled");
    const reduceMotion = document.getElementById("reduceMotion");

    if (weightUnit) weightUnit.value = state.settings.weightUnit;
    if (distanceUnit) distanceUnit.value = state.settings.distanceUnit;
    if (notifications) notifications.checked = state.settings.notificationsEnabled;
    if (reduceMotion) reduceMotion.checked = state.settings.reduceMotion;

    applyMotionPreference();
}

function saveSettings() {
    state.settings.weightUnit = document.getElementById("weightUnit").value;
    state.settings.distanceUnit = document.getElementById("distanceUnit").value;
    state.settings.notificationsEnabled = document.getElementById("notificationsEnabled").checked;
    state.settings.reduceMotion = document.getElementById("reduceMotion").checked;

    saveState();
    applyMotionPreference();

    showToast("Settings Saved", "Your preferences have been updated.");
}

function applyMotionPreference() {
    document.body.classList.toggle("reduce-motion", Boolean(state.settings.reduceMotion));
}

function resetDailyQuests() {
    state.quests = state.quests.map(quest => ({ ...quest, completed: false }));

    saveState();
    renderPage();

    showToast("Daily Reset", "Quest board is ready for another run");
}

function resetAllProgress() {
    const confirmed = window.confirm("Reset all locally saved progress?");

    if(!confirmed){
        return;
    }

    state = structuredClone(defaultState);

    saveState();
    populateSettingsForm();
    renderShared();
    renderPage();

    showToast("System Reset", "Local progress has been cleared.");
}

