class ContentProvider {
    static async fetchNewspaperDocument() {
        const response = await fetch('https://example.com/diarios/');
        const parser = new DOMParser();
        return parser.parseFromString(await response.text(), 'text/html');
    }

    static async fetchNewspaperLinks() {
        const doc = await ContentProvider.fetchNewspaperDocument();
        const carousel = doc.documentElement.querySelector('.carousel');
        const links = Array.from(carousel.querySelectorAll('a'));
        return links.filter(a => !a.className.includes('carousel-control'));
    }
}

class NewspaperContainer {
    constructor(container, newspapers) {
        this.container = container;
        this.newspapers = newspapers;
    }

    static create(newspapers) {
        const oldContainer = document.getElementById('newspapers');
        const container = document.createElement('div');
        container.id = 'newspapers';
        oldContainer.parentNode.replaceChild(container, oldContainer);
        return new NewspaperContainer(container, newspapers);
    }

    render() {
        this.newspapers.forEach(newspaper => {
            this.container.appendChild(newspaper.render());
            this.container.appendChild(document.createElement('hr'));
        });
    }
}

class Newspaper {
    constructor(title, thumbnail, src) {
        this.title = title;
        this.thumbnail = thumbnail;
        this.src = src;
    }

    static getTitleFromAnchor(anchor) {
        const url = anchor.href.slice(anchor.href.indexOf('/diarios'));
        const text = url.match(/\/diarios\/[\d]{4}\/[\d]{1,2}\/[\d]{1,2}\/([a-zA-Z\-]+)-/)[1];
        return text.substring(0, text.lastIndexOf('-'));
    }

    static getSrcFromAnchor(img) {
        return `https://${img.src.slice(img.src.indexOf('s3.amazonaws.com'))}`;
    }

    static createFromLink(anchor) {
        const img = anchor.querySelector('img');
        return new Newspaper(
            Newspaper.getTitleFromAnchor(anchor),
            img.src,
            Newspaper.getSrcFromAnchor(img)
        );
    }

    render() {
        const img = document.createElement('img');
        img.src = this.thumbnail;

        const link = document.createElement('a');
        link.target = '_blank';
        link.title = this.title;
        link.href = this.src;
        link.appendChild(img);

        return link;
    }
}

const exec = async () => {
    const newspaperLinks = await ContentProvider.fetchNewspaperLinks();
    const newspapers = newspaperLinks.map(Newspaper.createFromLink);
    const container = NewspaperContainer.create(newspapers);
    container.render();
};

window.addEventListener('load', exec);
