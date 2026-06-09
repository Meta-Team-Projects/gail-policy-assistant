import jsPDF from 'jspdf'

const cleanInlineText = (text) => String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/SOURCE_FILE/gi, 'SOURCE FILE')
    .replace(/DOCUMENT_LINK/gi, 'DOCUMENT LINK')
    .replace(/&emsp;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[*`>#~]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()

const cleanMarkdownText = (text) => String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/SOURCE_FILE/gi, 'SOURCE FILE')
    .replace(/DOCUMENT_LINK/gi, 'DOCUMENT LINK')
    .replace(/&emsp;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const extractAnswerOrFullText = (text) => {
    const value = String(text || '')
    const answerMatch = value.match(/(?:\*\*)?\s*Answer\s*:\s*(?:\*\*)?\s*([\s\S]*)/i)
    return answerMatch?.[1] || value
}

const formatSources = sources => {
    if (!Array.isArray(sources) || !sources.length) return ''

    const sourceLines = sources
        .map(source => {
            const fileName = source?.source_file || source?.file || source?.filename || source?.document_name
            if (!fileName) return ''

            return source?.page
                ? `- File: ${fileName} (Page: ${source.page})`
                : `- File: ${fileName}`
        })
        .filter(Boolean)

    return sourceLines.length
        ? `\n\nSources:\n\n${sourceLines.join('\n')}`
        : ''
}

const getDownloadText = (response, formatResponse) => {
    if (response && typeof response === 'object' && response.answer) {
        return cleanMarkdownText(response.answer)
    }

    const formatted = formatResponse
        ? String(formatResponse(response) || '')
        : String(response || '')

    return cleanMarkdownText(extractAnswerOrFullText(formatted))
}

const sanitizeFilename = (value) => String(value || 'gail-answer')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    .replace(/-+$/g, '')
    || 'gail-answer'

export const downloadAnswerAsPdf = ({
    response,
    formatResponse,
    sources = [],
    title = 'GAIL Response',
    filename = 'gail-answer.pdf',
}) => {
    const answerText = `${getDownloadText(response, formatResponse)}${formatSources(sources)}`

    if (!answerText) {
        alert('No answer text found to download.')
        return
    }

    const pdf = new jsPDF()
    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const maxLineWidth = pageWidth - margin * 2
    let y = margin

    const ensureSpace = (lineHeight = 6) => {
        if (y > pageHeight - margin - lineHeight) {
            pdf.addPage()
            y = margin
        }
    }

    const addWrappedText = ({
        text,
        x = margin,
        fontSize = 11,
        fontStyle = 'normal',
        lineHeight = 6,
        width = maxLineWidth,
        after = 2,
    }) => {
        const clean = cleanInlineText(text)
        if (!clean) {
            y += after
            return
        }

        pdf.setFont('helvetica', fontStyle)
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(clean, width)
        lines.forEach(line => {
            ensureSpace(lineHeight)
            pdf.text(line, x, y)
            y += lineHeight
        })
        y += after
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    const titleLines = pdf.splitTextToSize(cleanInlineText(title), maxLineWidth)
    titleLines.forEach(line => {
        ensureSpace(7)
        pdf.text(line, margin, y)
        y += 7
    })

    y += 4

    answerText.split('\n').forEach(rawLine => {
        const line = rawLine.trim()

        if (!line) {
            y += 4
            return
        }

        if (/^\*{0,2}\s*(document|document link)\s*:/i.test(line)) {
            return
        }

        if (/^\|?[\s:-|]+\|[\s:-|]*$/.test(line)) {
            return
        }

        if (/^\|.*\|$/.test(line)) {
            const cells = line
                .split('|')
                .map(cell => cleanInlineText(cell))
                .filter(Boolean)
            addWrappedText({
                text: cells.join('  |  '),
                fontSize: 10,
                width: maxLineWidth,
                after: 1,
            })
            return
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
        if (headingMatch) {
            const level = headingMatch[1].length
            addWrappedText({
                text: headingMatch[2],
                fontSize: level === 1 ? 14 : level === 2 ? 12 : 11,
                fontStyle: 'bold',
                lineHeight: level === 1 ? 7 : 6,
                after: 3,
            })
            return
        }

        const bulletMatch = line.match(/^[-*]\s+(.+)$/)
        if (bulletMatch) {
            addWrappedText({
                text: `- ${bulletMatch[1]}`,
                x: margin + 4,
                width: maxLineWidth - 4,
                after: 1,
            })
            return
        }

        const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/)
        if (numberedMatch) {
            addWrappedText({
                text: `${numberedMatch[1]}. ${numberedMatch[2]}`,
                x: margin + 4,
                width: maxLineWidth - 4,
                after: 1,
            })
            return
        }

        addWrappedText({
            text: line,
            after: 3,
        })
    })

    const safeFilename = filename.endsWith('.pdf')
        ? `${sanitizeFilename(filename.slice(0, -4))}.pdf`
        : `${sanitizeFilename(filename)}.pdf`

    pdf.save(safeFilename)
}
