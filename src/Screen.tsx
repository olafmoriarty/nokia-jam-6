import { useState, useEffect, useRef } from 'react';
import darkLetterSrc from './assets/classic_dark.png';
import lightLetterSrc from './assets/classic_light.png';
import buttonSrc from './assets/hash-button.png';
import letterPositionsJSON from './letterPositions.json';
import titleScreen from './assets/title-screen.png';
import endScreen from './assets/end-screen.png';

const Screen = ( props : Props ) => {
	const { displayText, inputText, showInput, updateDisplayCache, image } = props;

	const [ buttonAnimationPressed, setButtonAnimationPressed ] = useState(false);

	const screenRef = useRef<HTMLCanvasElement>(null);

	const letterPositions = letterPositionsJSON as { [key : string] : letter }

	const startTimeRef = useRef(undefined as number|undefined);

	const images = {
		'TITLE': titleScreen,
		'THE END': endScreen,
	} as { [key : string] : string }

	useEffect(() => {
		updateMainScreen( displayText );
	}, [ displayText, image ]);

	useEffect(() => {
		updateInput( inputText );
	}, [ inputText, showInput, displayText ]);



	const wordWidth = (word : string) => word.split("").reduce((acc, current) => acc + (letterPositions[current] ? letterPositions[current].width + 1 : 0), 0) - 1;

	const drawWord = (context : CanvasRenderingContext2D, word : string, line : 0|1|2|3, xPos : number ) => {
		const letters = new Image();
		letters.src = darkLetterSrc;

		letters.onload = () => {
			let letterX = 0;

			for (let i = 0; i < word.length; i++) {
				const l = word.charAt(i);
				if (l in letterPositions) {
					const letterMeta = letterPositions[l] as letter;
					context.drawImage( letters, letterMeta.pos, 0, letterMeta.width, 8, xPos + letterX, (1 + (line * 9)), letterMeta.width, 8 );
					letterX = letterX + letterMeta.width + 1;
				}
			}
			
		}
	}

	useEffect(() => {
		requestAnimationFrame(animateProgressIcon);
	}, []);

	useEffect(() => {
		updateButtonAnimation();
	}, [buttonAnimationPressed, showInput]);

	const animateProgressIcon = (time : number) => {
		if (startTimeRef.current === undefined) {
			startTimeRef.current = time;
		}
		else {
			const timePassed = time - startTimeRef.current;
			setButtonAnimationPressed(timePassed % 1000 < 500 ? false : true );
		}
		requestAnimationFrame( animateProgressIcon );
	}

	const updateInput = (sentence : string) => {
		if (sentence === undefined) {
			return;
		}
		const canvas = screenRef.current;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}
		context.clearRect(0, 38, 84, 10);
		if (!showInput) {
			return;
		}
		context.fillStyle = '#43523d';
		context.fillRect(0, 38, 84, 10);

		const letters = new Image();
		letters.src = lightLetterSrc;

		letters.onload = () => {
			let truncSentence = sentence;
			while (wordWidth(truncSentence) > 73) {
				truncSentence = truncSentence.substring(1);
			}
			truncSentence = "> " + truncSentence;
			let letterX = 0;

			for (let i = 0; i < truncSentence.length; i++) {
				const l = truncSentence.charAt(i);
				if (l in letterPositions) {
					const letterMeta = letterPositions[l] as letter;
					context.drawImage( letters, letterMeta.pos, 0, letterMeta.width, 8, 1 + letterX, 39, letterMeta.width, 8 );
					letterX = letterX + letterMeta.width + 1;
				}
			}
			
		}
	}

	const updateButtonAnimation = () => {
		if (showInput) {
			return;
		}
		const canvas = screenRef.current;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}
		const button = new Image();
		button.src = buttonSrc;
		button.onload = () => {
			if (!image) {
				context.clearRect(0, 38, 84, 10);
			}
			context.clearRect(37, 38, 10, 10);
			context.drawImage(button, buttonAnimationPressed ? 10 : 0, 0, 10, 10, 37, 38, 10, 10);
		}
	}


	const updateMainScreen = (sentence : string) => {
		if (sentence === undefined) {
			return;
		}
		const canvas = screenRef.current;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}
		context.clearRect(0, 0, 84, 38);

		if ( image && (image in images)) {
			const background = new Image();
			background.src = images[image];
			background.onload = () => {
				context.drawImage(background, 0, 0);
			}
			return;
		}

		let line = 0 as 0|1|2|3;
		let xPos = 1;
		const maxWidth = 83;
		const spaceWidth = 4;
		const wordArray = sentence.split(' ');
		
		for (let i = 0; i < wordArray.length; i++) {
			const word = wordArray[i];
			const width = wordWidth(word);
			if (xPos !== 1 && xPos + width > maxWidth ) {
				
				xPos = 1;
				line++;

				if (line > 3) {
					updateDisplayCache( wordArray.slice(i).join(' ') );
					return;
				}
			}
			drawWord( context, word, line as 0|1|2|3, xPos );
			xPos = xPos + spaceWidth + width;
		}
	}





	useEffect(() => {
		const canvas = screenRef.current;
		if (!canvas) {
			return;
		}
		updateMainScreen(displayText);
		updateInput(inputText);
	}, []);

	return <canvas className="game-display" width={84} height={48} ref={screenRef}></canvas>
}

type letter = {
	pos : number,
	width : number,
}

type Props = {
	displayText : string,
	inputText :  string,
	showInput : boolean,
	updateDisplayCache : ( text : string ) => void,
	image? : string,
}

export default Screen;