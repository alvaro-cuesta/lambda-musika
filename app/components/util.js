// Pretty-print seconds as MM:SS
export function toMinSecs(secs) {
    let mins = Math.floor(secs / 60)
    secs = Math.floor(secs % 60)

    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
}
