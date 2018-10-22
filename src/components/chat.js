import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";

import { firebaseAuth, database } from "../firebase-config";

class Chat extends React.Component {
  state = { roomName: "" };

  componentDidMount() {}

  changeRoomName = ({ target }) => this.setState({ roomName: target.value });

  signOut = () => firebaseAuth.signOut();

  createRoom = e => {
    const { roomName } = this.state;
    const { uid } = this.props.app.info;

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

          let updates = {
            [`/${newRoomId}`]: {
              id: newRoomId,
              members: { [uid]: uid },
              name: roomName,
              lastMessageSent: ""
            }
          };

          database.ref("/rooms").update(updates);

          this.updateRoomOfUser(newRoomId);
        } else {
          const dt = Object.entries(data)[0][1];

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
        console.log("get list room", data);
      });
  };

  render() {
    const { info = {}, isLogin } = this.props.app;
    const { roomName } = this.state;
    const { userName, photoUrl } = info;

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
              />
              <i className="fa fa-plus-circle " onClick={this.createRoom} />
            </WrappSearch>
            <ListConversation>
              <Conversation>
                <ConversationAvatar>
                  <Avatar
                    src="https://lh6.googleusercontent.com/-pGGttR63cbo/AAAAAAAAAAI/AAAAAAAAADY/3LJW1l1bV0s/photo.jpg"
                    alt="avatar"
                  />
                </ConversationAvatar>
                <ConversationBody>
                  <ConversationTitle>Phuong Bui</ConversationTitle>
                  <ConversationText>Cái ông bà già</ConversationText>
                </ConversationBody>
              </Conversation>
            </ListConversation>
          </LeftContent>
          <RightContent>
            <ChatHeader>
              <ChatHeaderLeft>
                <Avatar
                  src="https://lh6.googleusercontent.com/-pGGttR63cbo/AAAAAAAAAAI/AAAAAAAAADY/3LJW1l1bV0s/photo.jpg"
                  alt="avatar"
                />
                <p>Phuong Bui</p>
              </ChatHeaderLeft>
              <ChatHeaderRight>
                <i className="fa fa-comment" />

                <i className="fa fa-camera" />
                <i className="fa fa-phone" />
              </ChatHeaderRight>
            </ChatHeader>
            <ChatContent>
              <WrappOtherMessage>
                <Avatar
                  src="https://lh6.googleusercontent.com/-pGGttR63cbo/AAAAAAAAAAI/AAAAAAAAADY/3LJW1l1bV0s/photo.jpg"
                  alt="avatar"
                />
                <Message>Hello baby</Message>
              </WrappOtherMessage>
              <WrappMyMessage>
                <Message>Hello baby</Message>

                <Avatar
                  src="https://lh6.googleusercontent.com/-pGGttR63cbo/AAAAAAAAAAI/AAAAAAAAADY/3LJW1l1bV0s/photo.jpg"
                  alt="avatar"
                />
              </WrappMyMessage>
            </ChatContent>
            <ChatFooter>
              <Input placeholder="Write a message" />
              <i className="fa fa-microphone" />
              <i className="fa fa-id-card" />
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
  color: #e3e3e3;
  margin: 0 10px;
  flex: 1;

  &:focus {
    outline: none;
  }
`;

const ListConversation = styled.div`
  padding: 0 20px;
`;
const Conversation = styled.div`
  display: flex;
  align-items: center;
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
  padding: 0 20px;
`;
const WrappOtherMessage = styled.div`
  display: flex;
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
  }
`;
const WrappMyMessage = styled.div`
  display: flex;
  justify-content: flex-end;
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
`;
