document.addEventListener("DOMContentLoaded", () => {
    const triggerBtn = document.getElementById("trigger-btn");
    const overlay = document.getElementById("inauguration-overlay");
    const video = document.getElementById("success-video");
    const channel = window.BroadcastChannel ? new BroadcastChannel("inauguration-sync") : null;

    // ==========================================
    // REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
    const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfaOfiJDNJO0iUf_AkuedW_leMTvtT6BoK62s5sRSRS9VIi3NrnZ38F_Dd4ENL-NCRPQ/exec"; 
    // ==========================================
    
    const POLL_MS = 2000;
    const SESSION_STARTED_AT = Date.now();
    const LOCAL_TRIGGER_KEY = "inauguration-last-trigger-ts";
    const PREVIEW_MS = 3000;
    let localPollTimer = null;
    let hasStarted = false;
    let isPrimed = false;

    // Primer: Browsers require a user interaction to play video with sound
    // Both screens need ANY click anywhere on the page to unlock video capability
    document.body.addEventListener("pointerdown", primeVideoAudio, { once: true });

    async function primeVideoAudio() {
        if (isPrimed) return;
        try {
            video.muted = true;
            await video.play();
            video.pause();
            video.currentTime = 0;
            video.muted = false;
            video.volume = 1;
            isPrimed = true;
        } catch (error) {
            console.warn("Audio prime failed:", error);
        }
    }

    if (triggerBtn) {
        triggerBtn.addEventListener("click", async () => {
            if (hasStarted) return;
            
            await primeVideoAudio();
            
            triggerBtn.textContent = "Processing...";
            triggerBtn.style.opacity = "0.7";

            // Start sequence on this screen and notify sibling screen in same browser.
            publishLocalTrigger();
            startInaugurationSequence();

            await sendAppScriptTrigger();
            // Other machines/screens will start when their polling sees this fresh trigger.
        });
    }

    // Instant sync for two windows/tabs in the same browser profile.
    if (channel) {
        channel.onmessage = (event) => {
            if (!event?.data || hasStarted) return;
            if (event.data.type === "TRIGGER" && Number(event.data.timestamp) >= SESSION_STARTED_AT) {
                startInaugurationSequence();
            }
        };
    }

    window.addEventListener("storage", (event) => {
        if (event.key !== LOCAL_TRIGGER_KEY || hasStarted || !event.newValue) return;
        const ts = Number(event.newValue);
        if (!Number.isNaN(ts) && ts >= SESSION_STARTED_AT) {
            startInaugurationSequence();
        }
    });

    // Start polling automatically
    if (APP_SCRIPT_URL && APP_SCRIPT_URL !== "YOUR_APP_SCRIPT_URL_HERE") {
        localPollTimer = setInterval(pollAppScriptStatus, POLL_MS);
    } else {
        console.warn("Please add your APP_SCRIPT_URL in script.js");
        if(triggerBtn) {
            triggerBtn.textContent = "MISSING APPS SCRIPT URL";
        }
    }

    async function sendAppScriptTrigger() {
        try {
            // Send trigger with timestamp so old triggers do not auto-play on refresh.
            await fetch(APP_SCRIPT_URL + "?action=trigger&t=" + Date.now(), { mode: "no-cors" });
            console.log("Trigger sent to Apps Script");
        } catch (error) {
            console.warn("Trigger failed:", error);
        }
    }

    async function pollAppScriptStatus() {
        if (hasStarted) return;

        try {
            // Append timestamp to bypass caching
            const query = `${APP_SCRIPT_URL}?action=status&after=${SESSION_STARTED_AT}&t=${Date.now()}`;
            const response = await fetch(query);
            
            if (!response.ok) return;
            
            const data = await response.json();

            const triggeredAt = Number(data && data.triggeredAt);

            // Only start for fresh trigger events created after this page loaded.
            if (data && data.triggered === true && !Number.isNaN(triggeredAt) && triggeredAt >= SESSION_STARTED_AT) {
                console.log("Sync signal received. Playing video on this local screen!");
                startInaugurationSequence();
            }
        } catch (error) {
            console.warn("Poll failed. (If testing locally, wait for it to succeed)", error);
        }
    }

    function publishLocalTrigger() {
        const now = Date.now();
        localStorage.setItem(LOCAL_TRIGGER_KEY, String(now));
        if (channel) {
            channel.postMessage({ type: "TRIGGER", timestamp: now });
        }
    }

    async function runVideo() {
        video.classList.remove("hidden");
        if (overlay) {
            overlay.classList.add("hidden");
        }
        video.currentTime = 0;
        video.volume = 1;
        video.muted = false;

        try {
            if (video.requestFullscreen) {
                await video.requestFullscreen();
            }
        } catch (error) {
            console.warn("Fullscreen permission error:", error);
        }

        try {
            await video.play();
        } catch (error) {
            console.warn("Playback blocked, missing user click:", error);
            // Fallback play without sound
            video.muted = true;
            video.play();
        }
    }

    function startInaugurationSequence() {
        if (hasStarted) return;
        hasStarted = true;
        clearInterval(localPollTimer);

        if (triggerBtn) {
            triggerBtn.textContent = "INAUGURATING...";
            triggerBtn.disabled = true;
            triggerBtn.style.opacity = "0.6";
            triggerBtn.style.cursor = "not-allowed";
        }

        if (overlay) {
            overlay.classList.remove("hidden");
        }

        setTimeout(() => {
            runVideo();
        }, PREVIEW_MS);
    }
});
