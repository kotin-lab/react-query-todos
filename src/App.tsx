import React, { useRef } from 'react';
import { useQuery, QueryClientProvider, QueryClient, useMutation } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import axios from 'axios';

// import { createTodo, deleteTodo, getTodos, Todo, updateTodo } from './lib/api';
import type { Todo } from './lib/api';

const queryClient = new QueryClient();
export const axiosClient = axios.create({
  baseURL: 'https://node-sqlite-api.onrender.com/api'
});

function TodoApp() {
  const textRef = useRef<HTMLInputElement>(null);
  // const {data: todos} = useQuery<Todo[]>('todos', getTodos, {
  //   initialData: []
  // });
  const {data: todos} = useQuery<Todo[]>(
    'todos', 
    async () => (await axiosClient.get<Todo[]>('/todos')).data, 
    {
      initialData: []
    }
  );

  // const updateMutation = useMutation(updateTodo, {
  //   onSuccess: () => queryClient.invalidateQueries('todos')
  // });
  const updateMutation = useMutation<Response, unknown, Todo>(
    todo => axiosClient.put(`/todos/${todo.id}`, todo), 
    {
      onSettled: () => queryClient.invalidateQueries('todos')
    }
  );

  // const deleteMutation = useMutation(deleteTodo, {
  //   onSuccess: () => queryClient.invalidateQueries('todos')
  // });
  const deleteMutation = useMutation<Response, unknown, Todo>(
    todo => axiosClient.delete(`/todos/${todo.id}`), 
    {
      onSettled: () => queryClient.invalidateQueries('todos')
    }
  );

  // const createMutation = useMutation(createTodo, {
  //   onSuccess: () => queryClient.invalidateQueries('todos')
  // });
  const createMutation = useMutation<Response, unknown, {text: string}>(
    data => axiosClient.post(`/todos`, data), 
    {
      onSettled() {
        queryClient.invalidateQueries('todos');
        textRef.current!.value = '';
      }
    }
  );

  return (
    <div className="App">
      <div className="todos">
        {todos?.map((todo: Todo) => (
          <React.Fragment key={todo.id}>
            <div>
              <input type="checkbox" checked={todo.done} onChange={() => {
                updateMutation.mutate({...todo, done: !todo.done});
              }} />
              <span>{todo.text}</span>
            </div>
            <button onClick={() => {
              deleteMutation.mutate(todo);
            }}>Delete</button>
          </React.Fragment>
        ))}
      </div>
      <div className='add'>
        <input type="text" ref={textRef} />
        <button onClick={() => {
          createMutation.mutate({text: textRef.current!.value ?? ''});
        }}>Add</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
