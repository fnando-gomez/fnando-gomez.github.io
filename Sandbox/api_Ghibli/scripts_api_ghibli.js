
fetch('https://ghibliapi.herokuapp.com/films')
    .then(response =>{
        return response.json()
    })
    .then(data =>{
        data.forEach(movie => { 
            
            //Create a div with a card class
            const card = document.createElement('div')
            card.setAttribute('class','card')

            //Create an "h1" and set the text content to the film's title
            const h1 = document.createElement('h1')
            h1.textContent = movie.title

            //Create an "h3" and set the text content to the film's director
            const p1 = document.createElement('p')
            p1.textContent = `Director: ${movie.director}`

            //Create a "p" and set the text content to the film's description
            const p = document.createElement('p')
            movie.description = movie.description.substring(0,300)// Limit to 300 chars
            p.textContent = `${movie.description}...`

            container.appendChild(card)

            card.appendChild(h1)
            card.appendChild(p)
            card.appendChild(p1)
            
        });
    })
    .catch(err=>{
        const errorMessage = document.createElement('marquee')
        errorMessage.textContent = "Oops, something isn't working in the Ghibli studio"

        app.appendChild(errorMessage)
    })

    const app = document.getElementById('root')

    const logo = document.createElement('img')
        logo.src = 'logo.png'

    const container = document.createElement('div')
    container.setAttribute('class', 'container')

    app.appendChild(logo)
    app.appendChild(container)
