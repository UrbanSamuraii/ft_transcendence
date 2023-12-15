import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from 'axios';

export async function getConversations() {
  try {
    const API_URL = 'http://localhost:3001';
    const config: AxiosRequestConfig = { withCredentials: true };

    const response = await axios.get(`${API_URL}/conversations`, config);
    console.log({"RESPONSE FROM AXIOS.GET": response.data});
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { conversations: [] }; // Return an empty array in case of an error
  }
}