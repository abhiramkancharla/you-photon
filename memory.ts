import fs from "fs"
import path from "path"

const FILE_PATH = path.join(process.cwd(), "memory.json")

interface Decision {
    text: string
    response: string
    timestamp: string
}

interface Memory {
    identity: string | null
    decisions: Decision[]
    ready: boolean
}

function load(): Memory {
    if (fs.existsSync(FILE_PATH)) {
        return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) as Memory
    }
    return { identity: null, decisions: [], ready: false }
}

function save(data: Memory): void {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

export function getMemory(): Memory {
    return load()
}

export function setIdentity(identity: string): void {
    const mem = load()
    mem.identity = identity
    mem.ready = true
    save(mem)
}

export function addDecision(text: string, response: string): void {
    const mem = load()
    mem.decisions.push({ text, response, timestamp: new Date().toISOString() })
    if (mem.decisions.length > 50) {
        mem.decisions = mem.decisions.slice(-50)
    }
    save(mem)
}

export function getRecent(n: number = 10): Decision[] {
    return load().decisions.slice(-n)
}