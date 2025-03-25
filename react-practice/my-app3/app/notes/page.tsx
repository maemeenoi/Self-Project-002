import Link from "next/link";
import PocketBase from "pocketbase";
import style from "./Notes.module.css";
import CreateNote from "./CreateNote";

export const dynamic = 'auto',
    dynamicParams = true,
    revalidate = 0,
    fetchCache = 'auto',
    runtime = 'nodejs',
    preferredRegion = 'auto'


async function getNotes() {
    const db = new PocketBase('http://127.0.0.1:8090');
    const result = await db.collection('Post_It').getList(0, 50); // Fetch up to 50 notes
    console.log('Fetched notes:', result.items); // Log the fetched notes
    return result.items as any[];
}


export default async function NotesPage() {
    const notes = await getNotes();
    return (
        <>
            <h1>Notes</h1>
            <div>
                {notes?.map((note) => {
                    return <Note key={note.id} note={note} />;
                })}
            </div>
            <CreateNote />

        </>
    )
}

function Note({ note }: any) {
    const { id, title, content, created } = note || {};
    return (
        <Link href={`/notes/${id}`}>
            <div className={style.note}>

                <h2>{title}</h2>
                <h5>{content}</h5>
                <p>{created}</p>
            </div>
        </Link>
    )
}
