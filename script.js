//edit label data : https://github.com/huynhthanhnhan/MyImage/blob/master/Document/LabelFaceDescriptor
//get data: in console (F12) run: window.CreateLabelFaceDescriptor()

const descriptionURL = 'https://raw.githubusercontent.com/huynhthanhnhan/MyImage/master/Document/LabelFaceDescriptor';
const databaseURL = 'https://kd-api.demo-application.net/greetingmsgs?eventname=women20102019&is_verified=true&email=';

// const fs = require('fs')
import { loadingStory, sayswho, initFlipCamera } from './reference.js'
// import * as fs from './fs.js'
var loadingTitle = document.getElementById("loading");
var loadingContent = document.getElementById('loadingContent');
var content = document.getElementById('content');
var video = document.getElementById('video'),
    canvasVideo = document.getElementById('canvas')
var flipBtn = document.querySelector('#flip-btn');
var avatar = document.getElementById('avatar');

var browserInfo;
let isInitEnv = false;
var faceMatcher;
var image = new Image();
var detections;
var resizedDetections;
var results;
var runAnimate = false;
var messages = [];
var styleindex = 0;
var csWidth;
var csHeight;
var allowCapture = true;

// let data = "Learning how to write in a file."

// // Write data in 'Output.txt' . 
// fs.writeFile('Output.txt', data, (err) => {

//     // In case of a error throw err. 
//     if (err) throw err;
// })

$(document).ready(function() {
    loadingContent.textContent = loadingStory();
    var loadingInterval = setInterval(function() {
        if (!isInitEnv) {
            console.log()
            var text = loadingStory();
            $(loadingContent).hide();
            $(loadingContent).fadeIn('800').html(text);
        } else {
            clearInterval(loadingInterval);
        }

    }, 3000);
    $('body').sakura();
});

function detectCamera() {
    navigator.getMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    navigator.getMedia({
        video: true,
        audio: false
    }, function(stream) {
        video.srcObject = stream;
        video.play();
    }, function(error) {
        // alert("error: ", error);
    })
    console.log('detect camera complete')
}
// detectCamera();

function detectCameraMobile() {
    function hasGetUserMedia() {
        return (navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    if (hasGetUserMedia()) {
        const constraints = {
            video: {
                width: {
                    min: window.innerWidth
                },
                height: {
                    min: window.innerHeight
                },
                facingMode: {
                    exact: 'user'
                }
            }
        };

        const videoMobile = document.querySelector('video');

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                videoMobile.srcObject = stream;
            })
            .catch(err => {
                // alert(err);
            });
    } else {
        alert('getUserMedia() is not supported by your browser');
    }
}
detectCameraMobile();
initFlipCamera(video);


/////////////////////////////////////////// Load API ///////////////////////////////////////////
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(function() {
    getData();
})



////////////////////////// Store Lable Image data for Module Function //////////////////////////

async function getData() {
    let dt = await getJsonFromUrl(descriptionURL);
    const data = JSON.parse(JSON.stringify(dt));
    const labeledFaceDescriptorsData = data
        .map(({ _label, _descriptors }) => {
            return new faceapi.LabeledFaceDescriptors(_label, _descriptors.map((d) => {
                return new Float32Array(Object.keys(d).map(key => d[key]));
            }));
        });
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptorsData, 0.6);
    console.log(faceMatcher)
    console.log('load data complete')
    startDesktop();
}


////////////////////////////////////// Script Binding HTML /////////////////////////////////////
async function startDesktop() {
    video.style.display = "block";
    // console.log(video.getBoundingClientRect().width, video.getBoundingClientRect().height)

    // canvasVideo.height = video.getBoundingClientRect().height;
    // canvasVideo.width = video.getBoundingClientRect().width;
    console.log(video.videoHeight, video.videoWidth);
    canvasVideo.height = video.videoHeight;
    canvasVideo.width = video.videoWidth;
    csWidth = canvasVideo.width;
    csHeight = canvasVideo.height;

    function confirmRefresh() {
        var okToRefresh = confirm("Environments have been initialized, please reload page!");
        if (okToRefresh || !okToRefresh) {
            location.reload(true);
        }
    }


    if (canvasVideo.height == 0 || canvasVideo.width == 0) {
        // alert("System error has been occured, please reload page!")
        // return;
        confirmRefresh();
        return;
    }

    video.style.display = "none";

    console.log(canvasVideo.height, canvasVideo.width)
        // canvasVideo.style.display = "block";

    console.log('recognize')
        // await recognize();
    recognize();
    setInterval(function() {
        if (isInitEnv && !runAnimate && allowCapture) {
            recognize();

        }
    }, 5000)

}

async function recognize() {
    allowCapture = false;
    canvasVideo.getContext('2d').drawImage(video, 0, 0);
    const dataImage = canvasVideo.toDataURL();

    setTimeout(function() {
        ProcessMessage(dataImage);
    }, 1000)
}


////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////// Create Module Function For Face Recognition //////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////



async function ProcessMessage(imageUploadData) {
    console.log('porcessfd')
    const results = await FaceRecognition(imageUploadData);
    if (results.length > 0) {
        // for (var i = 0; i < results.length; i++) 
        {
            // console.log(results[i])
            var res = results[0].toString().split(" ");
            var email = res[0];
            if (res.length > 2)
                for (var i = 1; i < res.length - 1; i++)
                    email = email + " " + res[i];
            if (email != "unknown") {
                avatar.src = imageUploadData;
                avatar.classList.add("taken");
                // let dt = await getJsonFromUrl(databaseURL + email);
                let dt = [{ msg: 'Welcome to detect face demo. You are guest!' }];
                if (dt.length > 0) {
                    messages = dt;
                    console.log(messages)
                        // content.textContent = dt[0].msg;
                    runAnimate = true;
                    eachletter();
                    return;
                }
            }
        }
        let dt = [{ msg: 'Welcome to detect face demo. You are guest!' }];
        if (dt.length > 0) {
            messages = dt;
            // console.log(messages)
            runAnimate = true;
            eachletter();
            // content.textContent = dt[0].msg;
            // console.log(dt)
            avatar.src = imageUploadData;
            avatar.classList.add("taken");

        }
    }
    allowCapture = true;
}

////////////////////// Function get input image: URL link or Base64 image //////////////////////
async function FaceRecognition(imageUploadData) {


    // if (isValidURL(imageUploadData))
    //     await getBase64ImageFromUrl(imageUploadData)
    //     .then(result => image.src = result)
    // else
    image.src = imageUploadData;
    // console.log('start detect', imageUploadData)
    // console.log(faceapi)
    detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    if (!isInitEnv) {
        loadingTitle.style.display = "none";
        loadingContent.style.display = "none";
        flipBtn.style.display = "block";
        video.style.display = "block";
        content.style.display = "block";
    }
    isInitEnv = true;
    // console.log('end detect')
    resizedDetections = faceapi.resizeResults(detections, { width: 100, height: 100 });
    results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
    // for (var i = 0; i < resizedDetections.length; i++) {
    //     results[i].size = resizedDetections[i].detection.box;
    // }
    return results;
}

function eachletter() {
    if (runAnimate && messages.length > 0) {
        video.style.display = "none";
        flipBtn.style.display = "none";
        $(".l1").text(messages[styleindex].msg);
        $('.l1').each(function() {
            $(this).html($(this).text().replace(/([^ ])/g, "<span class='letter'>$&</span>"));
        });
        do_animate();
    }
}

// eachletter();

function do_animate() {

    anime.timeline({ loop: false })
        .add({
            targets: '.l1 .letter',
            translateY: [100, 0],
            translateZ: 0,
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 5000,
            delay: function(el, i) {
                return 300 + 30 * i;
            }
        }).add({
            targets: '.l1 .letter',
            translateY: [0, -100],
            opacity: [1, 0],
            easing: "easeInExpo",
            duration: 5000,
            delay: function(el, i) {
                return 100 + 30 * i;
            },
            complete: function(anim) {
                // console.log(messages)

                // console.log(styleindex)
                // console.log("compelte: ", styleindex)
                styleindex++;
                if (styleindex == messages.length) {
                    styleindex = 0;
                    runAnimate = false;
                    allowCapture = true;
                    video.style.display = "block";
                    flipBtn.style.display = "block";
                }
                //     // content.textContent = ""
                // }
                eachletter();

            }
        });

}

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// EXTEND //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////// Load data for Label Image from Json file ///////////////////////////

async function getJsonFromUrl(url) {
    var dt = await (await fetch(url)).json();
    return dt;
}