import styled from 'styled-components';
import { PageProps } from './styleType';

export const CSB_WIDTH: number = 350;

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

export const Button = styled.button `
  width: 100%;
  height: 70px;
  background-color: #2b09ff;
  color: #fff
  outline: none !important;
  border: none !important;
`;

export const Button42 = styled.button `
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
  top: 75px;
  height: 100%;
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
    top:0;
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
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin-left: ${CSB_WIDTH}px; 
  background-color: #1f1f1f;
`;

export const ConversationPannelStyle = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
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

export const Button2FA = styled.button `
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

export const MessageContainerStyle = styled.div `
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

export const MessageContainerPersonnalStyle = styled.div `
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

export const MessageContainerHeaderStyle = styled.div `
  background: inherit;
  width: 100%;
  height: 80 px;
  padding: 8px;
  margin: 5px 0;
`;