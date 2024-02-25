import { useState, useEffect, useRef } from 'react';
import { Story } from 'inkjs';

import Keypad from './Keypad';
import Screen from './Screen';

import inkJson from './ink/cold-case-json.json';
import './App.css';


function App() {
	const [ink, setInk] = useState(undefined as undefined | InstanceType<typeof Story>); 
	const [emptyInk, setEmptyInk] = useState(''); 
	const [image, setImage] = useState(undefined as string|undefined);
	const [inputSentence, setInputSentence] = useState('');
	const [currentKey, setCurrentKey] = useState(undefined as Key|undefined);
	const [presses, setPresses] = useState(0);
	const [displayText, setDisplayText] = useState("");
	const [showInput, setShowInput] = useState(true);
	const [displayCache, setDisplayCache] = useState('');
	const [previousCommand, setPreviousCommand] = useState(undefined as string|undefined);
	const [audioPlayer] = useState(new Audio());

	const cursorTimeout = useRef(undefined as undefined|number); 

	useEffect(() => {
		const inkFile = new Story(inkJson);
		setEmptyInk(inkFile.state.toJson());
		if (localStorage.getItem('coldCaseSave')) {
			const savefile = JSON.parse( localStorage.getItem('coldCaseSave') || '') as Save;
			inkFile.state.LoadJson(savefile.ink);
			setDisplayText(savefile.displayText);
			setDisplayCache(savefile.displayCache);
			setShowInput( savefile.displayCache || !inkFile.currentChoices.length ? false : true );
			if (inkFile.currentTags?.includes('image')) {
				setImage(savefile.displayText.trim());
			}
		}
		setInk(inkFile); 
	}, []);

	useEffect(() => {
		if (!displayText) {
			progress();
		}
	}, [ink]);

	useEffect(() => {
		let timeout = undefined as number|undefined;
		if (currentKey) {
			timeout = setTimeout(() => {
				setInputSentence(inputSentence + currentLetter());
				setCurrentKey(undefined);
				setPresses(0);
			}, 1000);
		}
		return () => {
			clearTimeout(timeout);
		}
	}, [currentKey, presses]);

	const saveGame = (text? : string, inkfile? : string, cache? : string) => {
		if (!ink) {
			return;
		}
		const oldSave = localStorage.getItem('coldCaseSave') ? JSON.parse( localStorage.getItem('coldCaseSave') || '') as Save : { ink: ink.state.toJson(), displayText: displayText };

		const newSave = {
			ink: inkfile || oldSave.ink,
			displayText: text === undefined ? oldSave.displayText : text,
			displayCache: cache || '',
		}
		localStorage.setItem('coldCaseSave', JSON.stringify(newSave));
	}

	const playSound = (url : string) => {
		audioPlayer.src = url;
		audioPlayer.oncanplay = () => {
			audioPlayer.play();
		}
	}

	const parseText = (text : string) => {
		return text.trim().replace('PICK UP', 'GET').split(' ').map(word => {
			const w = word.toUpperCase();
			if (['THE', 'TO', 'AT', 'ON', 'A', 'AN', 'INTO', 'WITH'].includes(w)) {
				return '';
			}
			if (w === 'EXAMINE' || w === 'SEARCH' || w === 'L') {
				return 'LOOK';
			}
			if (w === 'TAKE' || w === 'G') {
				return 'GET';
			}
			if (w === 'MOVE' || w === 'WALK' || w === 'M') {
				return 'GO';
			}
			if (w === 'SPEAK' || w === 'T') {
				return 'TALK';
			}
			if (w === 'U') {
				return 'USE';
			}
			if (w === 'I') {
				return 'INVENTORY';
			}

			return w;
		}).join(' ').replace(/ +/g	, ' ').trim();
	}

	const updateDisplayCache = (text : string) => {
		setDisplayCache(text || '');
		if (text) {
			saveGame(undefined, undefined, text);
			setShowInput(false);
		}
	}

	const progress = (input? : string) => {

		setInputSentence('');
		setCurrentKey(undefined);
		setPresses(0);

		if (!ink) {
			return;
		}
		if (displayCache.length) {
			setDisplayCache('');
			setDisplayText(displayCache);
			setShowInput( ink.currentChoices.length ? true : false );
			saveGame(displayCache, undefined, '');
			return;
		}

		if (!ink.canContinue) {
			if (input && ink.currentChoices.length) {
				setPreviousCommand( input );
				if (parseText(input) === 'HELP' || parseText(input) === 'H') {
					const commandList = ink.currentChoices.map(el => el.text.split('|')[0]).join(', ').toLowerCase();
					setDisplayText(commandList);
					return;
				}

				if (parseText(input) === 'RESTART') {
					ink.state.LoadJson(emptyInk);
					progress();
					return;
				}

				for (let i = 0; i < ink.currentChoices.length; i++) {

					ink.currentChoices[i].text.split('|').forEach(el => console.log(parseText(el)));

					if (ink.currentChoices[i].text.split('|').map(el => parseText(el)).includes(parseText(input))) {
						ink.ChooseChoiceIndex(i);
						const text = ink.Continue();
						if (text !== null) {
							setDisplayText(text);
							saveGame(text, ink.state.toJson());
						}
						setShowInput( ink.currentChoices.length ? true : false );
						return;
					}
				}

				setDisplayText('Invalid command. Type HELP to show valid commands.');
				playSound('./sounds/odd1.wav');
			}
			if (!ink.currentChoices.length) {
				// Game is over
				ink.state.LoadJson(emptyInk);
				progress();
				return;
			}
			return;
		}
		const text = ink.Continue();

		if (text !== null) {
			if (ink.currentTags?.includes('image')) {
				setImage(text.trim());
			}
			else {
				setImage(undefined);
			}
	
			setDisplayText(text);
			setShowInput( ink.currentChoices.length ? true : false );

			saveGame(text, ink.state.toJson());

			if (ink.currentTags?.includes('sound')) {
				playSound('./sounds/odd2.wav');
			}

		}
	}

	const keyMappings = {
		"2": ["A", "B", "C"],
		"3": ["D", "E", "F"],
		"4": ["G", "H", "I"],
		"5": ["J", "K", "L"],
		"6": ["M", "N", "O"],
		"7": ["P", "Q", "R", "S"],
		"8": ["T", "U", "V"],
		"9": ["W", "X", "Y", "Z"],
	} as { [key : string]: string[]}

	const currentLetter = () => currentKey ? keyMappings[currentKey][(presses - 1) % keyMappings[currentKey].length] : '';

	const input = (key : Key) => {
		const letterKeys = ["2", "3", "4", "5", "6", "7", "8", "9"];

		if (letterKeys.includes(key)) {

			if (key === currentKey) {
				setCurrentKey(key);
				setPresses(presses + 1);
			}
			else {
				clearTimeout(cursorTimeout.current);
				setInputSentence(inputSentence + currentLetter());
				setCurrentKey(key);
				setPresses(1);
			}
		}

		if (key === '0') {
			setInputSentence( inputSentence + currentLetter() + ' ' );
			setCurrentKey(undefined);
			setPresses(0);
		}

		if (key === '1' && previousCommand) {
			setInputSentence( previousCommand );
			setCurrentKey(undefined);
			setPresses(0);
		}

		if (key === '*' || key === 'Backspace') {
			if (currentKey) {
				setCurrentKey(undefined);
				setPresses(0);
			}
			else {
				setInputSentence( inputSentence.substring( 0, inputSentence.length - 1 ) )
			}
		}

		if (key === '#' || key === 'Enter') {
			progress( inputSentence + currentLetter() );
		}
	}

  return (
    <div className="wrapper">
		<Screen 
			displayText={ displayText } 
			inputText={ `${inputSentence}${currentKey ? currentLetter() : "_"}` } 
			showInput={ showInput }
			updateDisplayCache={ updateDisplayCache }
			image={ image }
		/>
		<input type="text" readOnly autoFocus className="hidden-input" onKeyDown={(ev) => {
			input(ev.key as Key);
		}} onBlur={(ev) => {
			ev.preventDefault();
			ev.target.focus();
		}} />
		<Keypad inputFunc={input} />
    </div>
  )
}

type Key = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "*" | "0" | "#" | "Enter" | "Backspace";

type Save = {
	ink : string,
	displayText : string,
	displayCache : string,
}

export default App;