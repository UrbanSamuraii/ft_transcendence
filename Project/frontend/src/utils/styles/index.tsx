import styled from 'styled-components';
import { PageProps } from './styleType';

export const CSB_WIDTH: number = 350;
export const NAVBAR_HEIGHT: number = 2; // define in rem


export const InputField = styled.input`
  font-family: 'Inter';
  background-color: inherit;
  outline: none !important;
  border: none !important;
  color: #fff !important;
  font-size: 18px !important;
  width: 100% !important;
  box-sizing: border-box;
  padding: 0 !important;
  margin: 4px 0 !important;

  ::placeholder {
    color: #fff !important;
    background-color: inherit !important;
  }
`;

export const InputContainer = styled.div`
  background-color: #131313;
  padding: 12px 16px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
`;

export const InputLabel = styled.label`
  display: block;
  color: #8f8f8f;
  font-size: 14px;
  margin: 4px 0;
`;

export const Button = styled.button`
  width: 100%;
  height: 70px;
  background-color: #2b09ff;
  color: #fff
  outline: none !important;
  border: none !important;
`;

export const Button42 = styled.button`
  width: 100%;
  height: 90px; !important;
  background-color: #000;
  color: #fff
  outline: none !important;
  border: none !important;
  transition: background-color 0.2s ease;
  cursor: pointer;
`;

export const Page = styled.div`
  width: 100%;
  background-color: #1a1a1a;
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
  background-color: #1a1a1a;
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
    background-color: #151515;
    height: 80px;
    border-bottom: 1px solid #606060;
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
  bottom: 0;
  width: 100%;
  height: 100%;
  margin-left: ${CSB_WIDTH}px; 
  background-color: #1f1f1f;
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
  margin-left: ${CSB_WIDTH}px;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
`;

export const OverlayContent = styled.div`
  margin-right: ${CSB_WIDTH}px;
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
  background-color: #3c3c9c;
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
  flex-grow: 1;
  background: black;
  width: 100%;
  height: 80px;
  border-bottom: 1px solid #606060;
  border-left: 1px solid #606060;
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
  width: 85%; /* Adjust as needed */
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
  width: 45px; /* Fixed width for MessageSendButton to keep it a circle */
  min-width: 45px; /* Minimum width for MessageSendButton */
  height: 45px; /* Fixed height for MessageSendButton to keep it a circle */
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