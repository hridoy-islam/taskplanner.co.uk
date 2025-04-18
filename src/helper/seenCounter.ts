interface Task {
    id: string;
    author: string; 
    assigned: string; 
    seen: boolean;
  }
  
  interface TaskCountResult {
    totalAssignedTasks: number;
    unseenTasks: number;
  }
  
  export const countUnseenTasks = (
    tasks: Task[],
    authorId: string,
    assignedId: string,
  ): TaskCountResult => {

    // console.log(tasks,"ahsh")
    const filteredTasks = tasks.filter(
      task => task?.author?._id === authorId && task?.assigned?._id === assignedId
    );
  
    const unseenCount = filteredTasks.filter(task => !task?.seen).length;

    return {
      totalAssignedTasks: filteredTasks.length,
      unseenTasks: unseenCount
    };
  };
  