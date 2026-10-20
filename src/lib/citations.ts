// Turns "(p. 3)" and "(pp. 3-4)" into links that jump the PDF viewer to the first cited page.
export const linkCitations = (text: string) =>
    text.replace(/\((pp?)\. ?(\d+)(?:\s*[-–,]\s*\d+)*\)/g, (match, _p, first) => `[${match}](#page-${first})`)
