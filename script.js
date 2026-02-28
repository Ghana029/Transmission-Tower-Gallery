const modal = document.getElementById("modal");
const fullImg = document.getElementById("full-img");
const captionText = document.getElementById("caption-text");
const images = Array.from(document.querySelectorAll(".gallery-img")); // 配列に変換
const closeBtn = document.querySelector(".close");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

let currentIndex = 0;



// 画像を更新する関数
function updateModal(index) {
    currentIndex = index;
    const targetImg = images[currentIndex];
    fullImg.src = targetImg.src;
    captionText.innerText = targetImg.getAttribute("data-location") || "";
}

// 画像クリックでモーダルを開く
images.forEach((img, index) => {
    img.addEventListener("click", () => {
        modal.style.display = "block";
        updateModal(index);
    });
});

// 次の画像へ
nextBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // 背景クリックイベントの発火を防ぐ
    let nextIndex = (currentIndex + 1) % images.length; // 最後まで行ったら最初に戻る
    updateModal(nextIndex);
});

// 前の画像へ
prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    let prevIndex = (currentIndex - 1 + images.length) % images.length; // 最初だったら最後へ
    updateModal(prevIndex);
});
// 「次へ」ボタンのクリック時
nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // 音を鳴らす（再生位置リセット & メディア情報クリア）
    playSound();

    let nextIndex = (currentIndex + 1) % images.length;
    updateModal(nextIndex);
});

// 「前へ」ボタンのクリック時
prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // 音を鳴らす
    playSound();

    let prevIndex = (currentIndex - 1 + images.length) % images.length;
    updateModal(prevIndex);
});

// 音声再生とメディアセッションのクリアを共通関数化すると便利です
function playSound() {
    sparkSound.currentTime = 0;
    sparkSound.play().then(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: '', artist: '', album: '', artwork: []
            });
            navigator.mediaSession.playbackState = 'none';
        }
    }).catch(() => {});
}

// キーボード操作時も鳴らしたい場合はここに追加
document.addEventListener('keydown', (e) => {
    if (modal.style.display === "block") {
        if (e.key === "ArrowRight") {
            // nextBtn.click() を呼べば、上記の playSound() も連動して実行されます
            nextBtn.click();
        }
        if (e.key === "ArrowLeft") {
            prevBtn.click();
        }
        if (e.key === "Escape") modal.style.display = "none";
    }
});

// 閉じる処理などは以前のまま
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains('modal-wrapper')) {
        modal.style.display = "none";
    }
});

// キーボードの左右矢印キーでも操作可能に（PC用）
document.addEventListener('keydown', (e) => {
    if (modal.style.display === "block") {
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "Escape") modal.style.display = "none";
    }
});
// 画像の右クリックとドラッグを禁止
document.addEventListener('contextmenu', (e) => {
    if (e.target.nodeName === 'IMG') {
        e.preventDefault();
    }
}, false);

document.addEventListener('dragstart', (e) => {
    if (e.target.nodeName === 'IMG') {
        e.preventDefault();
    }
}, false);
// 既存のコードの一番下などに追加
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    // 少し余裕を持ってから（例：0.5秒後）消すと、モーションがしっかり見えます
    setTimeout(() => {
        loader.classList.add('loaded');
    }, 5000); // 2000ms = 2秒間は見せる設定
});
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    
    // ページ読み込み中はスクロールを禁止
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        loader.classList.add('loaded');
        // ローディングが消えるタイミングでスクロールを許可
        document.body.style.overflow = 'auto';
    }, 2000); 
});
let touchstartX = 0;
let touchendX = 0;

// スワイプ操作の検知
modal.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
});

modal.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleGesture();
});

function handleGesture() {
    if (touchendX < touchstartX - 50) {
        // 左にスワイプ → 次の画像へ
        nextBtn.click();
    }
    if (touchendX > touchstartX + 50) {
        // 右にスワイプ → 前の画像へ
        prevBtn.click();
    }
}
const sparkSound = new Audio('images/電子音1.mp3');
sparkSound.volume = 0.3;

// 1. ギャラリーの画像をクリックした時の処理をアップグレード
images.forEach((img, index) => {
    img.addEventListener("click", (e) => {
        // --- 音を鳴らす ---
        sparkSound.currentTime = 0;
        sparkSound.play().catch(() => {});

        // --- エフェクトを発生させる ---
        createSparkEffect(e.clientX, e.clientY);

        // --- モーダルを開く（既存の処理） ---
        modal.style.display = "block";
        updateModal(index);
    });
});


// 全てのギャラリー画像を「表示されている順」で取得

// 画像をクリックしてモーダルを開く処理
images.forEach((img, index) => {
    img.addEventListener("click", (e) => {
        // 音声を鳴らす
        playSound();

        // ここで「何番目の画像か」を確実にセット
        currentIndex = index; 

        createSparkEffect(e.clientX, e.clientY);
        modal.style.display = "block";
        updateModal(currentIndex); // インデックスを渡す
    });
});

// 次の画像へ（順送りの計算を確実に）
nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    playSound();

    // 現在のインデックスに1を足し、枚数で割った余りを出す（ループ処理）
    currentIndex = (currentIndex + 1) % images.length;
    updateModal(currentIndex);
});

// 前の画像へ
prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    playSound();

    // 現在のインデックスから1を引き、枚数で割った余りを出す
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateModal(currentIndex);
});

// モーダルの中身を更新する関数
function updateModal(index) {
    const targetImg = images[index]; // インデックスに基づいて画像を選択
    fullImg.src = targetImg.src;
    captionText.innerText = targetImg.getAttribute("data-location") || "";
    
    // 中央にエフェクトを出す（お好みで）
    createSparkEffect(window.innerWidth / 2, window.innerHeight / 2);
}
// script.js の末尾などに追加
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault(); // メニューが出るのを阻止
    }
}, false);

// スマホの長押し対策をより強固にする
document.querySelectorAll('img').forEach(img => {
    // ドラッグして保存（PC）や、長押し（スマホ）を無効化
    img.ondragstart = () => { return false; };
});
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const headerText = document.querySelector('.fade-in-text'); // 追加
    
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        loader.classList.add('loaded');
        document.body.style.overflow = 'auto';

        // ローダーが消え始めた少し後に文章をフェードインさせる
        setTimeout(() => {
            if (headerText) {
                headerText.classList.add('visible');
            }
        }, 800); // 0.8秒のディレイで余韻を作る
    }, 2000); 
});

