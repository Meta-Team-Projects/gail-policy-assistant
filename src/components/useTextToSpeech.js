import { useEffect, useRef, useState } from 'react'

export const defaultTtsOptions = {
    lang: 'en-GB',
    rate: 0.7,
    pitch: 1.2,
    volume: 1,
    voiceName: 'Microsoft Zira - English (United States)',
}

const cleanSpeechText = (text) => String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\b(?:rs|Rs|RS)\.?\b/g, ' Rupees ')
    .replace(/[*_`>#|~]/g, ' ')
    .replace(/\//g, ' or ')
    .replace(/&emsp;|&nbsp;/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\\\/+\-_]/g, ' ')
    .replace(/([a-zA-Z0-9:])$/gm, '$1.')
    .replace(/\s+/g, ' ')
    .trim()

const extractAnswerOrFullText = (text) => {
    const value = String(text || '')
    const answerMatch = value.match(/(?:\*\*)?\s*Answer\s*:\s*(?:\*\*)?\s*([\s\S]*?)(?=\n\s*(?:\*\*)?\s*(?:References|Sources)\s*:|$)/i)
    return answerMatch?.[1] || value
}

const splitSpeechText = (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]
    const chunks = []
    let chunk = ''

    sentences.forEach(sentence => {
        const nextChunk = `${chunk} ${sentence}`.trim()

        if (nextChunk.length <= 180) {
            chunk = nextChunk
            return
        }

        if (chunk) {
            chunks.push(chunk)
        }

        if (sentence.length <= 180) {
            chunk = sentence.trim()
            return
        }

        const words = sentence.trim().split(/\s+/)
        chunk = ''
        words.forEach(word => {
            const nextWordChunk = `${chunk} ${word}`.trim()
            if (nextWordChunk.length > 180 && chunk) {
                chunks.push(chunk)
                chunk = word
            } else {
                chunk = nextWordChunk
            }
        })
    })

    if (chunk) {
        chunks.push(chunk)
    }

    return chunks
}

export const useTextToSpeech = ({ formatResponse, options = {} } = {}) => {
    const ttsOptions = { ...defaultTtsOptions, ...options }
    const [speakingMessageKey, setSpeakingMessageKey] = useState(null)
    const speechUtteranceRef = useRef(null)
    const speechChunksRef = useRef([])
    const speechChunkIndexRef = useRef(0)
    const speechKeepAliveRef = useRef(null)

    const getSpeechText = (response) => {
        if (response && typeof response === 'object' && response.answer) {
            return cleanSpeechText(response.answer)
        }

        const formatted = formatResponse
            ? String(formatResponse(response) || '')
            : String(response || '')

        return cleanSpeechText(extractAnswerOrFullText(formatted))
    }

    const getSelectedVoice = () => {
        const voices = window.speechSynthesis.getVoices()
        return voices.find(voice => voice.name === ttsOptions.voiceName)
            || voices.find(voice => voice.lang === ttsOptions.lang)
            || voices.find(voice => voice.lang?.startsWith(ttsOptions.lang.split('-')[0]))
            || null
    }

    const stopSpeech = () => {
        if (!('speechSynthesis' in window)) return

        if (speechKeepAliveRef.current) {
            clearInterval(speechKeepAliveRef.current)
            speechKeepAliveRef.current = null
        }

        window.speechSynthesis.cancel()
        speechUtteranceRef.current = null
        speechChunksRef.current = []
        speechChunkIndexRef.current = 0
        setSpeakingMessageKey(null)
    }

    const speakNextChunk = () => {
        if (!('speechSynthesis' in window)) return

        const chunk = speechChunksRef.current[speechChunkIndexRef.current]
        if (!chunk) {
            stopSpeech()
            return
        }

        const selectedVoice = getSelectedVoice()
        const utterance = new SpeechSynthesisUtterance(chunk)

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        utterance.lang = selectedVoice?.lang || ttsOptions.lang
        utterance.rate = ttsOptions.rate
        utterance.pitch = ttsOptions.pitch
        utterance.volume = ttsOptions.volume
        utterance.onend = () => {
            speechChunkIndexRef.current += 1
            speakNextChunk()
        }
        utterance.onerror = () => stopSpeech()

        speechUtteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        window.speechSynthesis.resume()
    }

    const handleSpeak = (messageKey, response) => {
        if (!('speechSynthesis' in window)) {
            alert('Text to speech is not supported in this browser.')
            return
        }

        if (speakingMessageKey === messageKey) {
            stopSpeech()
            return
        }

        stopSpeech()

        const speechText = getSpeechText(response)
        if (!speechText) return

        speechChunksRef.current = splitSpeechText(speechText)
        speechChunkIndexRef.current = 0
        setSpeakingMessageKey(messageKey)
        speakNextChunk()

        speechKeepAliveRef.current = setInterval(() => {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume()
            }
        }, 5000)
    }

    useEffect(() => {
        return () => {
            if (speechKeepAliveRef.current) {
                clearInterval(speechKeepAliveRef.current)
            }

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    return {
        speakingMessageKey,
        handleSpeak,
        stopSpeech,
        getSpeechText,
    }
}
