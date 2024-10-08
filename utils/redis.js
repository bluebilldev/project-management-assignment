const { redisClient } = require('../config/cache');

const updateCachedList = async (taskId, payload, listPattern, operation) => {
    try {
        const listKeys = await redisClient.keys(listPattern);

        for (const key of listKeys) {
            const cachedList = await redisClient.get(key);

            if (cachedList) {
                let taskList = JSON.parse(cachedList);

                if (operation === 'update') {
                    taskList.tasks = taskList.tasks.map(task => {
                        if (task._id.toString() === taskId) {
                            return { ...task, ...payload };
                        }
                        return task;
                    });
                } else if (operation === 'create') {
                    taskList.total += 1;
                    taskList.pages = Math.ceil(taskList.total / 10);
                    taskList.tasks.push(payload);
                } else if (operation === 'delete') {
                    taskList.total -= 1;
                    taskList.pages = Math.ceil(taskList.total / 10);
                    taskList.tasks = taskList.tasks.filter(task => task._id !== taskId);
                }

                await redisClient.setEx(key, 3600, JSON.stringify(taskList));
                console.log(`Cache updated for task operation: ${operation}`);
            }
        }
    } catch (error) {
        console.error('Error updating task list cache:', error);
    }
};

module.exports = { updateCachedList }