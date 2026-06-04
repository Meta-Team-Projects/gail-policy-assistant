import jsPDF from 'jspdf'

const cleanText = (text) => String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#|~]/g, ' ')
    .replace(/&emsp;|&nbsp;/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

const extractAnswerOrFullText = (text) => {
    const value = String(text || '')
    const answerMatch = value.match(/(?:\*\*)?\s*Answer\s*:\s*(?:\*\*)?\s*([\s\S]*?)(?=\n\s*(?:\*\*)?\s*(?:References|Sources)\s*:|$)/i)
    return answerMatch?.[1] || value
}

const getDownloadText = (response, formatResponse) => {
    if (response && typeof response === 'object' && response.answer) {
        return cleanText(response.answer)
    }

    const formatted = formatResponse
        ? String(formatResponse(response) || '')
        : String(response || '')

    return cleanText(extractAnswerOrFullText(formatted))
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
    title = 'GAIL Response',
    filename = 'gail-answer.pdf',
}) => {
    const answerText = getDownloadText(response, formatResponse)

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

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    const titleLines = pdf.splitTextToSize(cleanText(title), maxLineWidth)
    titleLines.forEach(line => {
        pdf.text(line, margin, y)
        y += 7
    })

    y += 4
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)

    const lines = pdf.splitTextToSize(answerText, maxLineWidth)
    lines.forEach(line => {
        if (y > pageHeight - margin) {
            pdf.addPage()
            y = margin
        }

        pdf.text(line, margin, y)
        y += 6
    })

    const safeFilename = filename.endsWith('.pdf')
        ? `${sanitizeFilename(filename.slice(0, -4))}.pdf`
        : `${sanitizeFilename(filename)}.pdf`

    pdf.save(safeFilename)
}
