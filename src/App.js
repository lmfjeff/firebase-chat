import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/analytics'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useEffect, useRef, useState } from 'react';

const firebaseConfig = {
  // your config
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const firestore = firebase.firestore()
firebase.analytics()


function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>Firebase Chat</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy = useRef()
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limitToLast(25)

  const [messages] = useCollectionData(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  useEffect(()=> {
    dummy.current.scrollIntoView({behavior:'smooth'})
  },[messages])

  const sendMessage = async(e) => {
    e.preventDefault()

    const {uid,photoURL} = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e)=>setFormValue(e.target.value)} />
        <button type="submit" disabled={!formValue}>▶</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`} >
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  )
}


export default App;
