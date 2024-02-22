const Keypad = (props : Props) => {
	const { inputFunc } = props;
	return (
		<section className="keypad">
			<button onClick={() => inputFunc("1")}>
				<p className="number">1</p>
				<p className="letters">repeat</p>
			</button>
			<button onClick={() => inputFunc("2")}>
				<p className="number">2</p>
				<p className="letters">abc</p>
			</button>
			<button onClick={() => inputFunc("3")}>
				<p className="number">3</p>
				<p className="letters">def</p>
			</button>
			<button onClick={() => inputFunc("4")}>
				<p className="number">4</p>
				<p className="letters">ghi</p>
			</button>
			<button onClick={() => inputFunc("5")}>
				<p className="number">5</p>
				<p className="letters">jkl</p>
			</button>
			<button onClick={() => inputFunc("6")}>
				<p className="number">6</p>
				<p className="letters">mno</p>
			</button>
			<button onClick={() => inputFunc("7")}>
				<p className="number">7</p>
				<p className="letters">pqrs</p>
			</button>
			<button onClick={() => inputFunc("8")}>
				<p className="number">8</p>
				<p className="letters">tuv</p>
			</button>
			<button onClick={() => inputFunc("9")}>
				<p className="number">9</p>
				<p className="letters">wxyz</p>
			</button>
			<button onClick={() => inputFunc("*")}>
				<p className="number">*</p>
				<p className="letters">delete</p>
			</button>
			<button onClick={() => inputFunc("0")}>
				<p className="number">0</p>
				<p className="letters">space</p>
			</button>
			<button onClick={() => inputFunc("#")}>
				<p className="number">#</p>
				<p className="letters">enter</p>
			</button>
		</section>
	)
}

type Props = {
	inputFunc : (key : "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "*" | "0" | "#") => void,
}

export default Keypad;