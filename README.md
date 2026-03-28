# Research Website Template

This is a complete GitHub Pages-ready academic website template that matches the mockup you selected:
- top profile section with photo and contact information
- short bio section
- interactive publication network on the left
- details panel on the right
- search input and publication slider
- hover labels for paper titles
- small PNG figure previews for each paper

## Included files

```text
research-website-png/
├── .nojekyll
├── index.html
├── README.md
├── LICENSE.txt
└── assets/
    ├── css/
    │   └── main.css
    ├── js/
    │   ├── data.js
    │   ├── network.js
    │   └── main.js
    ├── sass/
    │   └── main.scss
    ├── images/
    │   ├── profile-placeholder.png
    │   ├── favicon.png
    │   ├── paper-01.png ... paper-30.png
    │   └── video-thumb-01.png ... video-thumb-30.png
    └── webfonts/
        └── README.txt
```

## How to use

1. Upload the folder contents to a GitHub repository.
2. In GitHub, enable **Pages** for the repository.
3. Set the source to the main branch root.
4. Replace the placeholder content with your own data.

## Files you will likely edit first

### 1. Personal information
Edit `index.html`:
- name
- degrees
- work role
- email
- phone
- institution
- short bio

### 2. Publication data
Edit `assets/js/data.js`.
Each paper has:
- title
- year
- cluster
- keywords
- summary
- paper URL
- video URL
- figure image path
- video thumbnail path

### 3. Your photo and figures
Replace these files with your own PNG images:
- `assets/images/profile-placeholder.png`
- `assets/images/paper-01.png` to `paper-30.png`
- `assets/images/video-thumb-01.png` to `video-thumb-30.png`

## PNG recommendation
This version is configured for PNG figures in the right panel.
Recommended size for preview figures:
- width: 400 to 800 px
- low to medium file size for fast loading

## Notes
- The network itself is drawn in the browser using JavaScript and SVG elements.
- The paper figures and video thumbnails are PNG files.
- The website works as a static site, so it can be hosted directly on GitHub Pages.

## License
See `LICENSE.txt`.
