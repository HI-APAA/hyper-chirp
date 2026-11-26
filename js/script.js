const url = () => `https://hyperchirp.vercel.app/api/chirps`;
const chirpsContainer = document.querySelector('.chirps')
const button = document.querySelector('.load-data')
const loader = document.querySelector('.loader')
const form = document.querySelector('#chirp-form');
const nameInput = document.querySelectorAll('.name-input');
const submitButton = form.querySelector('button');

async function fetchChirps() {
    try {
        const response = await fetch(url())
        if(!response.ok) throw new Error("http", response.status)
        const chirps = await response.json();
        renderChirps(chirps);
        loading(false);
    }catch(error) {
        console.error(error);
    }
}

function renderCard (chirp) {
    const {author_name, content, likes, id} = chirp;
    const div = document.createElement('div');
    div.classList.add('chirp')
    div.innerHTML = `
            <h3>${author_name}</h3>
            <p>${content}</p>    
            `;
    const likeButton = document.createElement('button');
    likeButton.dataset.id = id;
    likeButton.classList.add('like-button');
    likeButton.textContent = `♡ ${likes}`;
    div.append(likeButton);
    return div;
}

function renderLikes() {
    const likedPosts = JSON.parse(localStorage.getItem('liked-posts') || '{}');
    document.querySelectorAll('.like-button').forEach((like) => {
        const likedPost = likedPosts[like.dataset.id];
        if (likedPost) {
            like.classList.add(...likedPost.classList);
            like.disabled = true;
        }
        like.addEventListener('click', () => {
            likePost(like.dataset.id, like); // runs the likePost function on the specific id and like that are associated with the button click 
        });
    })
}

function renderChirps (chirps) {
    chirps.forEach(chirp => {
        chirpsContainer.appendChild(renderCard(chirp))
    })
    renderLikes()
}

function loading(state) {
    loader.style.opacity = state ? 1 : 0;
    submitButton.textContent = state ? 'Loading...' : 'Post chirp'
    button.disabled = state
    submitButton.disabled = state
}

function handleClick() {
    loading(true);
    chirpsContainer.innerHTML = ''
    fetchChirps()
}

function handleSubmit() {
    loading(true);
    form.reset();
    fetchChirps();
}

async function likePost(id, like) {
    try {
        const response = await fetch(`${url()}/${id}/like`,
        {
            method: 'POST'
        }
    )
    if (!response.ok) throw new Error ("http", response.status);
    const postObject = await response.json();
    like.textContent = `♥︎ ${postObject.likes}`;
    like.classList.add('liked');
    like.disabled = true;
    const likedPosts = JSON.parse(localStorage.getItem('liked-posts') || '{}');
    likedPosts[like.dataset.id] = {
        id: like.dataset.id,
        classList: [...like.classList]
    };
    localStorage.setItem('liked-posts', JSON.stringify(likedPosts));
    
    } catch (error) {
        console.error(error);
}
}

async function postChirp(payload) {
    try {
      
        const response = await fetch(url(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        if(response.ok) {
            const data = await response.json();
            console.log(data)
            handleSubmit();
        }
    } catch(error) {
        console.error(error);
    }
}

// Save name input to local storage and display it


nameInput.forEach(nameInput => {
    nameInput.addEventListener('submit', event => {
        event.preventDefault();
        const nameData = new FormData(event.currentTarget);
        const username = {
            author_name: String(nameData.get('author_name') || '').trim()
        }
        if (!username.author_name) {
            alert('Please enter a name.');
            return;
        }
    localStorage.setItem('username', JSON.stringify(username));
    getUsernameFromLocalStorage();
    if (event.currentTarget.id === 'choose-name') {
    hideWelcomePopUp(username);
    };
})
});

function getUsernameFromLocalStorage() {
    const username = JSON.parse(localStorage.getItem('username') || '{}');

    nameInput.forEach(nameInput => {
        if (nameInput.id !== 'choose-name') {
            nameInput.elements.author_name.value = username.author_name || '';
        }
    });

    displaySavedNameInDocument(username);
}

getUsernameFromLocalStorage();

function displaySavedNameInDocument(username) {
    let displayUsername = document.querySelector('#saved-username');
    if (!username?.author_name) {
        return;
        }
    if (!displayUsername) {
        displayUsername = document.createElement('h2');
        displayUsername.id = 'saved-username';
        document.body.append(displayUsername);
    }
    displayUsername.textContent = username.author_name;
}

function hideWelcomePopUp(username) {
    const chooseNameInput = document.querySelector('#choose-name');
    const welcomePopUp = document.querySelector('#welcome-popup')
        if (chooseNameInput && username?.author_name) {
            welcomePopUp.classList.add('hidden');
    }
}

hideWelcomePopUp(JSON.parse(localStorage.getItem('username')));


form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    if (!String(JSON.parse(localStorage.getItem('username') || '{}').author_name || '').trim()) {
        document.querySelector('#welcome-popup').classList.remove('hidden');
        alert('Please choose a name before posting.');
        return;
    }
    const payload = {
        author_name: String(JSON.parse(localStorage.getItem('username') || '{}').author_name).trim(),
        content: formData.get('content'),
        tag: formData.get('tag') || undefined,
        is_anonymous: formData.has('is_anonymous'),
    };
    loading(true);
    postChirp(payload);
})

button.addEventListener('click', handleClick);

