import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import ReactAvatar from "react-avatar";
import moment from "moment";

import { firebaseAuth, database, firebaseStorage } from "../firebase-config";

class Chat extends React.Component {
  state = {
    roomName: "",
    listRoom: [],
    activeChat: 0,
    messages: {},
    message: ""
  };

  componentDidMount() {
    this.getListRoom();
  }

  changeRoomName = ({ target }) => this.setState({ roomName: target.value });

  signOut = () => firebaseAuth.signOut();

  createRoom = e => {
    const { roomName } = this.state;
    const { uid, userName, photoUrl } = this.props.app.info;

    if (!roomName) {
      return;
    }

    database
      .ref("rooms")
      .orderByChild("name")
      .equalTo(roomName)
      .once("value", snapshot => {
        const data = snapshot.val();

        if (!data) {
          const newRoomId = database
            .ref()
            .child("rooms")
            .push().key;

          const roomData = {
            id: newRoomId,
            members: { [uid]: uid },
            name: roomName,
            lastMessageSent: "beginning of chat"
          };

          let updates = {
            [`/${newRoomId}`]: roomData
          };

          database.ref("/rooms").update(updates);

          this.sentMessage(newRoomId, "beginning of chat");

          this.updateRoomOfUser(newRoomId);

          this.setState(({ listRoom }) => {
            let newListRoom = Array.from(listRoom);
            newListRoom.unshift(roomData);
            return {
              activeChat: newRoomId,
              listRoom: newListRoom
            };
          });
        } else {
          const dt = Object.entries(data)[0][1];

          this.setState(({ listRoom }) => {
            let newListRoom = Array.from(listRoom);
            newListRoom.unshift(dt);
            return {
              activeChat: dt.id,
              listRoom: newListRoom
            };
          });

          this.getMessage(dt.id);

          if (
            Object.keys(dt.members).filter(userId => userId === uid).length ===
            0
          ) {
            // update member of room
            const newMembers = { ...dt.members, [uid]: uid };
            const newRooms = { ...dt, members: newMembers };
            const updateRoom = {
              [`/${dt.id}`]: newRooms
            };

            database.ref("/rooms").update(updateRoom);

            // update room of user
            this.updateRoomOfUser(dt.id);
          }
        }
      });
  };

  sentMessage = (roomId, message) => {
    const { uid, userName, photoUrl } = this.props.app.info;

    database
      .ref(`messages/${roomId}`)
      .push()
      .set({
        sentBy: uid,
        datetime: moment().unix(),
        message: message,
        userName,
        photoUrl
      });

    database.ref(`rooms/${roomId}`).update({
      lastMessageSent: message
    });
  };

  updateRoomOfUser = roomId => {
    const { uid } = this.props.app.info;

    database.ref(`users/${uid}`).once("value", dt => {
      const { rooms = {} } = dt.val();

      let roomOfUser = { ...rooms, [roomId]: roomId };

      database.ref(`/users/${uid}`).update({ rooms: roomOfUser });
    });
  };

  getListRoom = () => {
    const { uid } = this.props.app.info;
    database
      .ref(`users/${uid}/rooms`)
      .limitToFirst(10)
      .once("value", dt => {
        const data = dt.val();

        if (!data) {
          return;
        }

        const rooms = Object.keys(data);

        if (rooms[0]) {
          this.getMessage(rooms[0]);
        }

        rooms.map(roomId => {
          database
            .ref("rooms")
            .orderByChild("id")
            .equalTo(roomId)
            .once("value", snapshot => {
              const data = snapshot.val();
              if (data) {
                this.setState(({ listRoom }) => {
                  listRoom.push({ ...data[roomId] });
                  return listRoom;
                });
              }
            });
        });
      });
  };

  scrollToBottom = () => {
    const chatContentElement = document.getElementById("chat-content");

    chatContentElement.scrollTop = chatContentElement.scrollHeight;
  };

  callbackGetMessage = roomId => snapshot => {
    const data = snapshot.val();

    this.setState(
      ({ messages }) => {
        let newMessages = { ...messages };

        if (newMessages.hasOwnProperty(roomId)) {
          newMessages[roomId].push(data);
        } else {
          newMessages[roomId] = [data];
        }

        return {
          messages: newMessages,
          activeChat: roomId
        };
      },
      () => this.scrollToBottom()
    );
  };

  getMessage = roomId => {
    database
      .ref(`messages/${roomId}`)
      .limitToLast(10)
      .on("child_added", this.callbackGetMessage(roomId));

    database
      .ref(`messages/${roomId}`)
      .limitToLast(10)
      .on("child_changed", this.callbackGetMessage(roomId));
  };

  onChangeMessage = ({ target }) => this.setState({ message: target.value });

  onEnterMessage = ({ key }) => {
    const { roomName, listRoom, activeChat, messages, message } = this.state;

    if (key === "Enter" && message !== "") {
      this.sentMessage(activeChat, message);

      this.setState({ message: "" });
    }
  };

  onEnterRoomName = ({ key }) => {
    if (key === "Enter") {
      this.createRoom();
    }
  };

  setActiveChat = roomId => () => {
    const { messages } = this.state;
    this.setState({ activeChat: roomId });

    if (!messages.hasOwnProperty(roomId)) {
      this.getMessage(roomId);
    }
  };

  onChangeImage = ({ target }) => {
    const file = target.files[0];
    // 1 - We add a message with a loading icon that will get updated with the shared image.

    const { uid, userName, photoUrl } = this.props.app.info;
    const { activeChat } = this.state;

    database
      .ref(`messages/${activeChat}`)
      .push({
        sentBy: uid,
        datetime: moment().unix(),
        imageUrl: "https://www.google.com/images/spin-32.gif?a",
        userName,
        photoUrl
      })
      .then(function(messageRef) {
        // 2 - Upload the image to Cloud Storage.
        var filePath =
          firebaseAuth.currentUser.uid + "/" + messageRef.key + "/" + file.name;
        return firebaseStorage
          .ref(filePath)
          .put(file)
          .then(function(fileSnapshot) {
            // 3 - Generate a public URL for the file.
            return fileSnapshot.ref.getDownloadURL().then(url => {
              // 4 - Update the chat message placeholder with the image's URL.
              return messageRef.update({
                imageUrl: url,
                storageUri: fileSnapshot.metadata.fullPath
              });
            });
          });
      })
      .catch(function(error) {
        console.error(
          "There was an error uploading a file to Cloud Storage:",
          error
        );
      });
  };

  render() {
    const { info = {}, isLogin } = this.props.app;
    const { roomName, listRoom, activeChat, messages, message } = this.state;
    const { userName, photoUrl, uid } = info;
    const listMessage = messages[activeChat] || [];

    return (
      <Wrapper>
        <Header>
          <div />
          <div>
            <h3>FireChat</h3>
          </div>
          <div className="wrapp-user">
            <Avatar src={photoUrl} alt="avatar" />
            <p>{userName}</p>
            <p onClick={this.signOut}>SIGN-OUT</p>
          </div>
        </Header>
        <Body>
          <LeftContent>
            <WrappSearch>
              <i className="fa fa-search" />
              <Input
                placeholder="join a room"
                value={roomName}
                onChange={this.changeRoomName}
                onKeyPress={this.onEnterRoomName}
              />
              <i className="fa fa-plus-circle " onClick={this.createRoom} />
            </WrappSearch>
            <ListConversation>
              {listRoom.map(room => (
                <Conversation
                  key={room.id}
                  active={activeChat === room.id}
                  onClick={this.setActiveChat(room.id)}
                >
                  <ConversationAvatar>
                    <ReactAvatar name={room.name} size={50} round={true} />
                  </ConversationAvatar>
                  <ConversationBody>
                    <ConversationTitle>{room.name}</ConversationTitle>
                    <ConversationText>{room.lastMessageSent}</ConversationText>
                  </ConversationBody>
                </Conversation>
              ))}
            </ListConversation>
          </LeftContent>
          <RightContent>
            <ChatHeader>
              <ChatHeaderLeft />
              <ChatHeaderRight>
                <i className="fa fa-comment" />

                <i className="fa fa-camera" />
                <i className="fa fa-phone" />
              </ChatHeaderRight>
            </ChatHeader>
            <ChatContent id="chat-content">
              {listMessage.map(mess => {
                if (mess.sentBy === uid) {
                  return (
                    <WrappMyMessage key={message.datetime}>
                      <Message>
                        {mess.message ? (
                          mess.message
                        ) : (
                          <img src={mess.imageUrl} alt="image" />
                        )}
                      </Message>

                      <Avatar src={mess.photoUrl} alt="avatar" />
                    </WrappMyMessage>
                  );
                }
                return (
                  <WrappOtherMessage key={message.datetime}>
                    <Avatar src={mess.photoUrl} alt="avatar" />
                    <Message>
                      {mess.message ? (
                        mess.message
                      ) : (
                        <img src={mess.imageUrl} alt="image" />
                      )}
                    </Message>
                  </WrappOtherMessage>
                );
              })}
            </ChatContent>
            <ChatFooter>
              <Input
                placeholder="Write a message"
                value={message}
                onChange={this.onChangeMessage}
                onKeyPress={this.onEnterMessage}
              />
              <i className="fa fa-microphone" />
              <label htmlFor="input-image">
                <input
                  className="choose-image"
                  id="input-image"
                  type="file"
                  accept="image/*"
                  onChange={this.onChangeImage}
                />
                <i className="fa fa-id-card" />
              </label>
            </ChatFooter>
          </RightContent>
        </Body>
      </Wrapper>
    );
  }
}

export default connect(({ app }) => ({
  app
}))(Chat);

const Header = styled.div`
  height: 70px;
  color: #fafafa;
  background: #2979ff;
  display: flex;
  padding: 0 20px;
  div {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .wrapp-user {
    justify-content: flex-end;
    p {
      margin-left: 16px;
      &:hover {
        cursor: pointer;
      }
    }
  }
`;
const Body = styled.div`
  display: flex;
  flex: 1;
`;

const Wrapper = styled.div`
  height: -webkit-fill-available;
  display: flex;
  flex-direction: column;
`;
const LeftContent = styled.div`
  display: flex;
  width: 30%;
  flex-direction: column;
  border-right: 1px solid #e3e3e3;
  padding-top: 20px;
`;

const Avatar = styled.img`
  border-radius: 50%;
  width: 50px;
  height: 50px;
`;
const WrappSearch = styled.div`
  display: flex;
  padding: 0 15px;
  align-items: center;

  input,
  input:focus {
  }
`;
const Input = styled.input`
  font-size: 18px;
  border: none;
  color: #999;
  margin: 0 10px;
  flex: 1;

  &:focus {
    outline: none;
  }
`;

const ListConversation = styled.div`
  padding-top: 10px;
`;
const Conversation = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-top: 1px solid red;
  background: ${({ active }) => (active ? "#A7FFEB" : "transparent")};
  &:hover {
    cursor: pointer;
  }
`;
const ConversationAvatar = styled.div`
  margin-right: 15px;
`;
const ConversationBody = styled.div`
  flex: 1;
`;
const ConversationTitle = styled.p``;
const ConversationText = styled.p``;
const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 20px;
`;
const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
`;
const ChatHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;
const ChatHeaderRight = styled.div`
  i {
    margin-left: 15px;
  }
`;
const ChatContent = styled.div`
  flex: 1;
  padding: 20px 20px 0 20px;
  height: calc(100vh - 91.44px);
  overflow: auto;
`;
const WrappOtherMessage = styled.div`
  display: flex;
  margin-bottom: 10px;
  div::before {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    top: 19px;
    left: -6px;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #e0e0e0;
    clear: both;
  }
  div {
    background: #e0e0e0;
    color: #424242;

    img {
      width: 100%;
    }
  }
`;
const WrappMyMessage = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  div::before {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    top: 19px;
    right: -6px;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid #651fff;
    clear: both;
  }
  div {
    background: #651fff;
    color: #fafafa;

    img {
      width: 100%;
    }
  }
`;
const Message = styled.div`
  padding: 16px;

  border-radius: 5px;
  position: relative;
  margin: 0 20px;
`;
const ChatFooter = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  background: #eeeeee;
  padding: 0 20px;
  input {
    background: transparent;
    margin-left: 0px;
  }

  i {
    margin-left: 15px;
  }

  .choose-image {
    visibility: hidden;
    position: absolute;
    left: 0;
  }
`;
