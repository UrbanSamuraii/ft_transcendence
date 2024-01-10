import styled from 'styled-components';
import { PageProps } from './styleType';

export const CSB_WIDTH: number = 350;
export const NAVBAR_HEIGHT: number = 2; // define in rem


export const InputField = styled.input`
  font-family: Arial, sans-serif;
  background-color: transparent;
  outline: none !important;
  border: none !important;
  color: white !important;
  font-size: 18px !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 4px 0 !important;

  ::placeholder {
    color: pink !important;
    background-color: inherit !important;
  }
`;

export const InputContainer = styled.div`
  background-color: transparent;
  padding: 12px 16px;
	border: 2px solid rgba(255, 255, 255, 0.137);
  border-radius: 50px;
  width: 100%;
  height: 57px;
  box-sizing: border-box;
`;

export const InputLabel = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  color: #fff;
  display: inline-block; 
`;

export const Button = styled.button`
  width: 100%;
  height: 57px;
	background-color: rgb(188, 143, 243, 0.5);
  color: rgb(0, 0, 0);
  outline: none !important;
  border: none !important;
  border-radius: 50px;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: rgba(188, 143, 243);
    transform: scale(1.05);
  }
`;

export const Button42 = styled.button`
  width: 100%;
  height: 46px;
  background-image: url(https://miro.medium.com/v2/resize:fit:2400/1*pyTVFh65W-y3JACaqGfIFQ.jpeg);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
	background-color: transparent;
  border-radius: 50px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: transparent;
    transform: scale(1.1);
  }
`;

export const Page = styled.div`
  width: 100%;
  background-image: url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NXx8fGVufDB8fHx8fA%3D%3D');
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ConversationSidebarStyle = styled.aside`
  position: fixed;
  left: 0;
  top: calc(${NAVBAR_HEIGHT}rem + 80px);
  height: calc(100% - ${NAVBAR_HEIGHT}rem - 80px);
  background-color: #1f1f1f;
  width: ${CSB_WIDTH}px;
  border-right: 1px solid #606060;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #606060 #1a1a1a;  

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #606060;
  }
  &::-webkit-scrollbar-track {
    background-color: #1a1a1a;
  }
  & header {
    position: fixed;
    display: flex;
    top: ${NAVBAR_HEIGHT}rem;
    justify-content: space-between;
    padding: 0 18px;
    background-color: #1f1f1f;
    height: 80px;
    width: ${CSB_WIDTH}px;
    border-bottom: 1px solid #606060;
    border-right: 1px solid #606060;
    
    & h2 {
      font-weight: 500;
      margin-right: 150px;
      color: #fff;
    }
    & .header-content {
      display: flex;
      align-items: center;
    }
  }
`;

export const ConversationChannelPageStyle = styled.div`
  position: fixed;
  left: 0;
  top: ${NAVBAR_HEIGHT}rem;
  width: 100%;
  height: 90%;
  margin-left: ${CSB_WIDTH}px; 
  background-color: #777777;
`;

export const ConversationPannelStyle = styled.div`
  position: fixed;
  left: 0;
  top: 3rem;
  width: calc(100% - ${CSB_WIDTH}px);
  height: calc(100% - 3rem);
  margin-left: ${CSB_WIDTH}px;
  background-color: #1f1f1f;
`;

export const ConversationSidebarContainer = styled.div`
  padding: 0px;
  width: ${CSB_WIDTH}px;
`;

export const ConversationSidebarItem = styled.div`
  display: flex;
  align-items: center; 
  gap: 15px;
  margin-bottom: 8px;
  margin-top: 8px;
  margin-left: 10px;
  width: ${CSB_WIDTH}px;
  height: 90px;
  border-bottom: 1px solid #606060;
`;

export const ConversationSidebarTexts = styled.div`
  display: flex;
  flex-direction: column; 
  align-items: flex-start; 
  gap: 5px;
  margin-bottom: 12px;
  margin-top: 0px;
  border-bottom: 1px
`;

export const Button2FA = styled.button`
  width: 60%;
  height: 50px;
  background-color: #2b09ff;
  color: #fff;
  display: block;
  margin: 0 auto;
  text-align: center;
`;

export const Text2FA = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  background-color: #1a1a1a;
  height: 130px;
  color: #fff;
  font-size: 2em;
`;

export const OverlayStyle = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  margin-right: ${CSB_WIDTH}px;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
`;

export const OverlayContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ButtonOverlay = styled.button`
  background-color: #1a1a1a;
  color: #fff; 
  border: none;
  padding: 0px 0px; 
  font-size: 16px; 
  border-radius: 5px;

  &:hover::before {
    content: "Click to open Conversations Menu";
    position: absolute;
    top: 60px;
    left: 70%;
    transform: translateX(-55%);
    background-color: #333;
    color: #fff;
    padding: 5px;
    border-radius: 3px;
    opacity: 0.8;
    font-size: 14px;
    white-space: nowrap;
  }
`;

export const ButtonCreateConv = styled.button`
  background-color: #1a1a1a;
  color: #fff; 
  border: none;
  padding: 0px 0px; 
  font-size: 16px; 
  border-radius: 5px;
  height: 40px;
  width: 200px;
`;

export const ButtonAddUser = styled.button`
  background-color: #3c3c9c;
  color: #fff; 
  border: none;
  padding: 0px 0px; 
  font-size: 12px; 
  border-radius: 0px;
  height: 30px;
  width: 100px;
`;

export const MessageContainerStyle = styled.div`
  flex-grow: 1;
  background: inherit;
  border: 1px solid #e0e0e0; 
  border-radius: 5px;
  padding: 8px;
  margin: 5px 0;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
  height: auto;
  width: calc(40% - 100px);
  margin-left: 50px;
`;

export const MessageContainerPersonnalStyle = styled.div`
  background: inherit;
  border: 1px solid #e0e0e0; 
  border-radius: 5px;
  padding: 8px;
  margin: 5px 0;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
  height: auto;
  width: calc(40% - 100px);
  margin-left: 40%;
  margin-right: 100px;
`;

export const MessageContainerHeaderStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: black;
  width: 100%;
  height: 80px;
  border-bottom: 1px solid #606060;

  .messagePanelTitle {
    margin-left: 100px;
    color: white;
  }

  .navbar-right {
    display: flex;
    align-items: center;

    button {
      font-size: 8rem;
      margin-left: 10px;
    }

    .profile-name {
      cursor: pointer;
      position: relative;
      user-select: none;
      font-size: 8rem;
    }

    .dropdown-menu {
      position: absolute;
      right: 0;
    }
  }
`;

export const MessageInputFieldStyle = styled.div`
  flex-grow: 1;
  min-width: 300px;   
  display: flex;
  position: fixed;
  bottom: 10px;
  left: calc(10px + ${CSB_WIDTH}px);
  right: 10px;
  padding: 10px;
  border: 1px solid #606060;
  border-radius: 5px;
`;

export const MessageInputContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const MessageInputTextArea = styled.textarea`
  min-width: 200px;   
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  resize: none;
  overflow: hidden;
  height: auto;
  width: 85%; 
  min-height: 54px;
  max-height: 162px;
  overflow-y: auto;
`;

export const MessageSendButton = styled.button`
  background: #2c333d;
  color: white;
  border: none;
  border-radius: 50%; 
  margin-top: 5px;
  margin-left: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  min-width: 45px;
  height: 45px;
`;

export const MessageSendIcon = styled.span`
  font-size: 100%;
  line-height: 1;
`;

export const DarkRedButton = styled.button`
background-color: darkred;
color: white;
font-style: italic;
font-size: 12px;
padding: 8px 16px;
border: none;
border-radius: 4px;
cursor: pointer;
`;
