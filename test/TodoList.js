const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TodoList Contract", function () {
  let TodoList, todo, owner;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    TodoList = await ethers.getContractFactory("TodoList");
    todo = await TodoList.deploy();
    await todo.waitForDeployment();
  });

  it("should start with zero tasks", async () => {
    const count = await todo.taskCount();
    expect(count).to.equal(0);
  });

  it("should create a task and emit TaskCreated", async () => {
    const tx = await todo.createTask("Write tests");
    const receipt = await tx.wait();

    const count = await todo.taskCount();
    expect(count).to.equal(1);

    const task = await todo.tasks(1);
    expect(task.id).to.equal(1);
    expect(task.content).to.equal("Write tests");
    expect(task.completed).to.equal(false);

    const event = receipt.logs.find(log => log.fragment.name === "TaskCreated");
    expect(event.args.id).to.equal(1);
    expect(event.args.content).to.equal("Write tests");
  });

  it("should toggle task completion and emit TaskCompleted", async () => {
    await todo.createTask("Test toggle");
    const original = await todo.tasks(1);
    expect(original.completed).to.equal(false);

    const tx = await todo.toggleCompleted(1);
    const receipt = await tx.wait();

    const updated = await todo.tasks(1);
    expect(updated.completed).to.equal(true);

    const event = receipt.logs.find(log => log.fragment.name === "TaskCompleted");
    expect(event.args.id).to.equal(1);
    expect(event.args.completed).to.equal(true);
  });

  it("should toggle completion back to false", async () => {
    await todo.createTask("Double toggle");
    await todo.toggleCompleted(1);
    await todo.toggleCompleted(1);

    const task = await todo.tasks(1);
    expect(task.completed).to.equal(false);
  });

  it("should revert when toggling non-existent task", async () => {
    await expect(todo.toggleCompleted(999)).to.be.reverted;
  });
});

