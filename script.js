const countdown = document.getElementById("倒數");
const openingDate = new Date(2026, 10, 1);
openingDate.setHours(0, 0, 0, 0);

const today = new Date();
today.setHours(0, 0, 0, 0);

const daysUntilOpening = Math.ceil((openingDate - today) / (1000 * 60 * 60 * 24));

if (daysUntilOpening > 0) {
    countdown.textContent = `距離高雄首場還有 ${daysUntilOpening} 天`;
} else if (daysUntilOpening === 0) {
    countdown.textContent = "今晚高雄首場，現場見。";
} else {
    countdown.textContent = "《清醒的頻率》巡演，期待下次與你相遇。";
}

const musicTracks = [...document.querySelectorAll("[data-track]")];

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "--:--";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

musicTracks.forEach((track) => {
    const audio = track.querySelector("audio");
    const playButton = track.querySelector(".music-play");
    const progress = track.querySelector(".music-progress");
    const currentTime = track.querySelector("[data-current-time]");
    const duration = track.querySelector("[data-duration]");
    const errorMessage = track.querySelector(".music-error");
    const title = track.querySelector(".music-title").textContent;

    const updateProgress = () => {
        currentTime.textContent = formatTime(audio.currentTime);
        duration.textContent = formatTime(audio.duration);
        const percentage = Number.isFinite(audio.duration) && audio.duration > 0
            ? (audio.currentTime / audio.duration) * 100
            : 0;
        progress.value = String(Math.round(percentage * 10));
        progress.style.setProperty("--played", `${percentage}%`);
    };

    playButton.addEventListener("click", () => {
        errorMessage.hidden = true;
        if (!audio.paused) {
            audio.pause();
            return;
        }

        musicTracks.forEach((otherTrack) => {
            const otherAudio = otherTrack.querySelector("audio");
            if (otherAudio !== audio) {
                otherAudio.pause();
            }
        });

        audio.play().catch(() => {
            errorMessage.textContent = "音檔無法播放，請確認音檔檔案存在且格式正確。";
            errorMessage.hidden = false;
        });
    });

    audio.addEventListener("play", () => {
        track.classList.add("is-playing");
        playButton.setAttribute("aria-label", `暫停${title}`);
        playButton.setAttribute("aria-pressed", "true");
    });

    audio.addEventListener("pause", () => {
        track.classList.remove("is-playing");
        playButton.setAttribute("aria-label", `播放${title}`);
        playButton.setAttribute("aria-pressed", "false");
    });

    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => {
        audio.currentTime = 0;
        updateProgress();
    });
    audio.addEventListener("error", () => {
        errorMessage.textContent = "音檔無法載入，請確認音檔檔案存在。";
        errorMessage.hidden = false;
    });

    progress.addEventListener("input", () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = (Number(progress.value) / Number(progress.max)) * audio.duration;
        }
    });
});
