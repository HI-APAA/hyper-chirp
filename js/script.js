const url = () => `https://hyperchirp.vercel.app/api/chirps`;
const chirpsContainer = document.querySelector('.chirps')
const button = document.querySelector('.load-data')
const loader = document.querySelector('.loader')
const form = document.querySelector('#chirp-form');
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
document.querySelectorAll('.like-button').forEach((like) => {
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
    like.disabled = true;
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

form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
        author_name: formData.get('author_name'),
        content: formData.get('content'),
        tag: formData.get('tag') || undefined,
        is_anonymous: formData.has('is_anonymous'),
    }
    loading(true);
    postChirp(payload);
})

button.addEventListener('click', handleClick);

