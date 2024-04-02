import { useEffect, useState } from "react";

export const useTypewriter = (words: string[], PHRASE_INTERVAL: number, LETTER_INTERVAL: number) => {

  const [word, setWord] = useState(words[0])
  const [wordIndex, setWordIndex] = useState(0);

  const [text, setText] = useState(words[0]);
  const [textIndex, setTextIndex] = useState(0);

  async function stopOver(){

    const result = await new Promise(resolve => {
      setTimeout(() => { resolve("") }, PHRASE_INTERVAL)
    })

    return result;
  }

  function changeWordIndex(){

    if((wordIndex + 1) > words.length - 1) {
      setWordIndex(0);
    }
    else {
      setWordIndex(wordIndex + 1); 
    }

  }

  useEffect(() => {

    setWord(words[wordIndex]);

  }, [wordIndex])

  useEffect(() => {

    let interval: NodeJS.Timeout;
    const wordLength = word.length - 1;

    setText(word.substring(0, textIndex));

    if(textIndex > wordLength){

      stopOver().then((val) => {
        setTextIndex(1);
        changeWordIndex();
      })

    } else {

      interval = setInterval(() => {
        setTextIndex(textIndex + 1);
      }, LETTER_INTERVAL)

    }

    return () => clearInterval(interval);


  }, [word, textIndex])

  return {text};

}

export default useTypewriter;