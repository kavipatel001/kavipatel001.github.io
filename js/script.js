console.log("Let's fetch the song");
let songs;
let currentSong = new Audio();
let currFolder;
let currentListItem = null;

function formatSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let linked = await fetch(`/${currFolder}/`);
    let response = await linked.text();

    let div1 = document.createElement("div");
    div1.innerHTML = response;
    let as = div1.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${currFolder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
                            <img class="invert" src="img/music.svg" alt="musicsvg">
                            <div class="info">
                                <div>${song.replaceAll("-"," ")}</div>
                                <div>Kavi</div>
                            </div>
                            <div class="playNow">
                                <span>Play now</span>
                                <img class="invert list-play-icon" src="img/play.svg" alt="playsvg" height="20px" width="20px">
                            </div>
                            </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            if (currentListItem === e && !currentSong.paused) {
                currentSong.pause();
                e.querySelectorAll(".list-play-icon").forEach(img => img.src = "img/play.svg");
                play.src = "img/play.svg";
                return;
            }
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim(), false, e);
        });
    });

    return songs;
}

const playMusic = (tracking, pause = false, clickedElement = null) => {
    currentSong.src = `/${currFolder}/` + tracking;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";

        document.querySelectorAll(".list-play-icon").forEach(img => img.src = "img/play.svg");

        if (clickedElement) {
            clickedElement.querySelectorAll(".list-play-icon").forEach(img => img.src = "img/pause.svg");
            currentListItem = clickedElement;
        }
    }

    document.querySelector(".songInfo").innerHTML = tracking;
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let linked = await fetch(`/songs/`);
    let response = await linked.text();
    let div1 = document.createElement("div");
    div1.innerHTML = response;
    let anchor = div1.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchor);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            let linked = await fetch(`/songs/${folder}/info.json`);
            let response = await linked.json();
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                                <circle cx="12" cy="12" r="12" fill="#1DB954" />
                                <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="#000000" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="image1">
                        <h2>${response.title}</h2>
                        <p>${response.dec}</p>
                    </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

            let firstListItem = document.querySelector(".songList").getElementsByTagName("ul")[0].getElementsByTagName("li")[0];

            playMusic(songs[0], false, firstListItem);
        });
    });
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";

            if (currentListItem) {
                currentListItem.querySelectorAll(".list-play-icon").forEach(img => img.src = "img/pause.svg");
            }
        } else {
            currentSong.pause();
            play.src = "img/play.svg";

            if (currentListItem) {
                currentListItem.querySelectorAll(".list-play-icon").forEach(img => img.src = "img/play.svg");
            }
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatSeconds(currentSong.currentTime)} / ${formatSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            let listItem = document.querySelector(".songList").getElementsByTagName("ul")[0].getElementsByTagName("li")[index - 1];
            playMusic(songs[index - 1], false, listItem);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            let listItem = document.querySelector(".songList").getElementsByTagName("ul")[0].getElementsByTagName("li")[index + 1];
            playMusic(songs[index + 1], false, listItem);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0){
                document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg", "img/volume.svg");
            }
    });

    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            
        }
    });

    // Auto-next song on end
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            // Play next song automatically
            let listItem = document.querySelector(".songList").getElementsByTagName("ul")[0].getElementsByTagName("li")[index + 1];
            playMusic(songs[index + 1], false, listItem);
        } else {
            // Last song, stop
            play.src = "img/play.svg";
            if (currentListItem) {
                currentListItem.querySelectorAll(".list-play-icon").forEach(img => img.src = "img/play.svg");
            }
        }
    });
}

main();
