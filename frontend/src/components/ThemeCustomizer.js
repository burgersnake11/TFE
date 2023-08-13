import React, { useState, useEffect } from "react";

const ThemeCustomizer = () => {
    const [buttonColor, setButtonColor] = useState('#764548');
    const [mainColor, setMainColor] = useState('#D9D9D9');
    const [mainFont, setMainFont] = useState('Arial, sans-serif');
    const [fontDarkColor, setFontDarkColor] = useState('black');
    const [fontLightColor, setFontLightColor] = useState('#D9D9D9');
    const [firstColor, setFirstColor] = useState('#9C5A5E');
    const [secondColor, setSecondColor] = useState('#764548');

    
    useEffect(() => {
        const storedButtonColor = localStorage.getItem('customButtonColor');
        if (storedButtonColor) {
            setButtonColor(storedButtonColor);
            changeValue(storedButtonColor, "buttonColor")
        }
        const storedMainColor = localStorage.getItem('customMainColor');
        if (storedMainColor) {
            setMainColor(storedMainColor);
            changeValue(storedMainColor, "mainColor")
        }
        const storedMainFont = localStorage.getItem('customMainFont');
        if (storedMainFont) {
            setMainFont(storedMainFont);
            changeValue(storedMainFont, "mainFont")
        }
        const storedFontDarkColor = localStorage.getItem('customFontDarkColor');
        if (storedFontDarkColor) {
            setFontDarkColor(storedFontDarkColor);
            changeValue(storedFontDarkColor, "fontDarkColor")
        }
        const storedFontLightColor = localStorage.getItem('customFontLightColor');
        if (storedFontLightColor) {
            setFontLightColor(storedFontLightColor);
            changeValue(storedFontLightColor, "fontLightColor")
        }
        const storedFirstColor = localStorage.getItem('customFirstColor');
        if (storedFirstColor) {
            setFirstColor(storedFirstColor);
            changeValue(storedFirstColor, "firstColor")
        }
        const storedSecondColor = localStorage.getItem('customSecondColor');
        if (storedSecondColor) {
            setSecondColor(storedSecondColor);
            changeValue(storedSecondColor, "secondColor")
        }
    }, []);

    function changeValue(value, id){
        if(id==="buttonColor"){
            localStorage.setItem('customButtonColor', value);
            setButtonColor(value)
            const style = document.createElement('style');
            style.textContent = `
            .bouton{
                background-color: ${value};
            }
            .bouton:hover{
                background-color: ${darkenColor(value, 30)};
            }
            `;
            document.head.appendChild(style);
        }
        else if(id==="mainColor"){
            localStorage.setItem('customMainColor', value);
            setMainColor(value)
            const style = document.createElement('style');
            style.textContent = `
                body{
                    background-color: ${value};
                }
                .main{
                    background-color: ${value};
                }
                `;
                document.head.appendChild(style);
        }
        else if(id==="mainFont"){
            localStorage.setItem('customMainFont', value);
            setMainFont(value)
            const style = document.createElement('style');
            style.textContent = `
                body{
                    font-family: ${value};
                }
                .main{
                    font-family: ${value};
                }
                `;
                document.head.appendChild(style);
        }
        else if(id==="fontDarkColor"){
            localStorage.setItem('customFontDarkColor',value)
            setFontDarkColor(value)
            const style = document.createElement('style');
            style.textContent = `
                .light{
                    color: ${value}
                }
            `;
            document.head.appendChild(style);
        }
        else if(id==="fontLightColor"){
            localStorage.setItem('customFontLightColor',value)
            setFontLightColor(value)
            const style = document.createElement('style');
            style.textContent = `
                .dark{
                    color: ${value}
                }
            `;
            document.head.appendChild(style);
        }
        else if(id==="firstColor"){
            localStorage.setItem('customFirstColor',value)
            setFirstColor(value)
            const style = document.createElement('style');
            style.textContent = `
                .mainColor{
                    background-color: ${value}
                }
            `;
            document.head.appendChild(style);
        }
        else if(id==="secondColor"){
            localStorage.setItem('customSecondColor',value)
            setSecondColor(value)
            const style = document.createElement('style');
            style.textContent = `
                .secondColor{
                    background-color: ${value};
                }
                .agenda_ligne{
                    border: 3px solid ${value};
                }
                .agenda_table{
                    border: 3px solid ${value};
                }
                .detail_border{
                    border: 3px solid ${value};
                }
            `;
            document.head.appendChild(style);
        }
    }

    function darkenColor(color, factor) {
        // Conversion de la couleur hexadécimale en valeurs RGB
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        
        // Assombrir chaque composante de couleur en fonction du facteur
        const darkenedR = Math.max(0, r - factor);
        const darkenedG = Math.max(0, g - factor);
        const darkenedB = Math.max(0, b - factor);
        
        // Conversion des composantes assombries en format hexadécimal
        const darkenedHex = `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
        
        return darkenedHex;
    }

    function setDefault(){
        changeValue("#764548", "buttonColor")
        changeValue("#D9D9D9", "mainColor")
        changeValue("Arial, sans-serif","mainFont")
        changeValue("black", "fontLightColor")
        changeValue("#D9D9D9", "fontDarkColor")
        changeValue("#764548", "firstColor")
        changeValue("#9C5A5E", "secondColor")
    }
    return (
        <div>
            <h3>Personnaliser le thème</h3>
            <button className="bouton light" onClick={setDefault}>Thème par défault</button>
            <br/>
            <label>Couleur des boutons:</label>
            <input
                id="buttonColor"
                type="color"
                value={buttonColor}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            />
            <br />
            <label>Couleur de fond:</label>
            <input
                id="mainColor"
                type="color"
                value={mainColor}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            />
            <br />
            <label>Couleur principale:</label>
            <input
                id="firstColor"
                type="color"
                value={firstColor}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            />
            <br />
            <label>Couleur secondaire:</label>
            <input
                id="secondColor"
                type="color"
                value={secondColor}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            />
            <br />
            <label>Police :</label>
            <select
                id="mainFont"
                value={mainFont}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Impact, sans-serif">Impact</option>
                <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                <option value="Lucida Sans, sans-serif">Lucida Sans</option>
            </select>
            <br />
            <label>Couleur de la police claire</label>
            <input
                id="fontDarkColor"
                type="color"
                value={fontDarkColor}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            />
            <br />
            <label>Couleur de la police foncée</label>
            <input
                id="fontLightColor"
                type="color"
                value={fontLightColor}
                onChange={(e) => changeValue(e.target.value, e.target.id)}
            />
        </div>
    );
};

export default ThemeCustomizer;
