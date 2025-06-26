console.log("Lets featch the song");
let songs;
let currentSong = new Audio();
let currFolder;

function formatSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    // Remove microseconds by taking only the integer part
    seconds = Math.floor(seconds);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let linked = await fetch(`${currFolder}/`);
    let response = await linked.text();
    // console.log(response);


    let div1 = document.createElement("div");
    div1.innerHTML = response;
    let as = div1.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }

    }

    




    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="musicsvg">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Kavi</div>
                            </div>
                            <div class="playNow">
                                <span>Play now</span>
                                <img id = "playing" class="invert" src="img/play.svg" alt="playsvg" height="20px" width="20px">
                            </div>
                            </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })
    return songs;
    
    


}

//play song
// var audio = new Audio(songs[1]);
// audio.play();
// audio.addEventListener("loadeddata", () => {
//     // let duration = audio.duration;
//     console.log(audio.duration, audio.currentSrc, audio.currentTime)
// });


const playMusic = (tracking, pause = false) => {
    // let audio = new Audio("/songs/" + tracking);
    currentSong.src = `/${currFolder}/` + tracking;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
        // playing.src = "img/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = tracking;
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let linked = await fetch(`songs/`);
    let response = await linked.text();
    let div1 = document.createElement("div");
    div1.innerHTML = response;
    let anchor = div1.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            let linked = await fetch(`songs/${folder}/info.json`);
            let response = await linked.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                                <!-- Green circular background -->
                                <circle cx="12" cy="12" r="12" fill="#1DB954" />

                                <!-- Black play arrow inside -->
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="#000000" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="image1">
                        <h2>${response.title}</h2>
                        <p>${response.dec}</p>
                    </div>`;

        }
    }
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            // console.log(item.target,item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);

        })
    })


}

async function main() {
    await getSongs("songs/ncs");
    // console.log(songs);
    playMusic(songs[0], true);

    //display albamb
    displayAlbums()


    //attach play next previous to event listener
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    //time update event for timechang

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${formatSeconds(currentSong.currentTime)} / ${formatSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add event listener in seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;

    })

    //hamburger click event
    document.querySelector(".hamburger").addEventListener("click", (b) => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector(".close").addEventListener("click", (b) => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add event listen to next and previous
    previous.addEventListener("click", () => {
        // console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {


            playMusic(songs[index - 1])
        }
    })


    next.addEventListener("click", () => {
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {


            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Set a volume to:", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0){
                document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg", "img/volume.svg");
            }
    })

    //add  event-listener to mute the volume
    document.querySelector(".volume > img").addEventListener("click",(e)=>{
        if(e.target.src.includes("img/volume.svg")){
             e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
             e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            
        }
    })


}


main()