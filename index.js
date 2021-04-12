class MazeBuilder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.mazeDimension = {
      cols: 2 * width + 1,
      rows: 2 * height + 1,
    };
    this.maze = this.initMazeWithInitalWall(this.width, this.height);

    this.recursiveDivision(1, this.height - 1, 1, this.width - 1);
  }

  recursiveDivision = (startRow, endRow, startCol, endCol) => {
    let horizontal, vertical, start, end, x, y;

    if (endRow < startRow || endCol < startCol) {
      return false;
    }

    if (startRow == endRow) {
      horizontal = startRow;
    } else {
      x = startRow + 1;
      y = endRow - 1;
      start = Math.round(startRow + (endRow - startRow) / 4);
      end = Math.round(startRow + (3 * (endRow - startRow)) / 4);
      horizontal = this.rand(start, end);
    }

    if (startCol == endCol) {
      vertical = startCol;
    } else {
      x = startCol + 1;
      y = endCol - 1;
      start = Math.round(startCol + (endCol - startCol) / 3);
      end = Math.round(startCol + (2 * (endCol - startCol)) / 3);
      vertical = this.rand(start, end);
    }

    for (
      let i = this.positionToWall(startRow) - 1;
      i <= this.positionToWall(endRow) + 1;
      i++
    ) {
      for (
        let j = this.positionToWall(startCol) - 1;
        j <= this.positionToWall(endCol) + 1;
        j++
      ) {
        if (
          i == this.positionToWall(horizontal) ||
          j == this.positionToWall(vertical)
        ) {
          this.maze[i][j] = ["wall"];
        }
      }
    }

    let gaps = this.shuffleArray([true, true, true, false]);

    // create gaps in partition walls

    if (gaps[0]) {
      let gapPosition = this.rand(startCol, vertical);
      this.maze[this.positionToWall(horizontal)][
        this.positionToSpace(gapPosition)
      ] = [];
    }

    if (gaps[1]) {
      let gapPosition = this.rand(vertical + 1, endCol + 1);
      this.maze[this.positionToWall(horizontal)][
        this.positionToSpace(gapPosition)
      ] = [];
    }

    if (gaps[2]) {
      let gapPosition = this.rand(startRow, horizontal);
      this.maze[this.positionToSpace(gapPosition)][
        this.positionToWall(vertical)
      ] = [];
    }

    if (gaps[3]) {
      let gapPosition = this.rand(horizontal + 1, endRow + 1);
      this.maze[this.positionToSpace(gapPosition)][
        this.positionToWall(vertical)
      ] = [];
    }

    // recursively partition newly created chambers

    this.recursiveDivision(startRow, horizontal - 1, startCol, vertical - 1);
    this.recursiveDivision(horizontal + 1, endRow, startCol, vertical - 1);
    this.recursiveDivision(startRow, horizontal - 1, vertical + 1, endCol);
    this.recursiveDivision(horizontal + 1, endRow, vertical + 1, endCol);
  };

  initMazeWithInitalWall = (width, height) => {
    const maze = new Array(this.mazeDimension.rows)
      .fill()
      .map(() => new Array(this.mazeDimension.cols).fill([]));

    maze.map((rows, indexRows) => {
      rows.map((cell, indexCols) => {
        switch (indexRows) {
          case 0:
          case this.mazeDimension.rows - 1:
            maze[indexRows][indexCols] = ["wall"];
            break;

          default:
            if (indexRows % 2 == 1) {
              if (indexCols == 0 || indexCols == this.mazeDimension.cols - 1) {
                maze[indexRows][indexCols] = ["wall"];
              }
            } else if (indexCols % 2 == 0) {
              maze[indexRows][indexCols] = ["wall"];
            }
        }
      });

      if (indexRows === 0) {
        // place exit in top row
        let doorPos = this.positionToSpace(this.rand(1, width));
        maze[indexRows][doorPos] = ["door", "exit"];
      }

      if (indexRows === this.mazeDimension.rows - 1) {
        // place entrance in bottom row
        let doorPos = this.positionToSpace(this.rand(1, width));
        maze[indexRows][doorPos] = ["door", "entrance"];
      }
    });

    return maze;
  };

  // source: https://stackoverflow.com/a/12646864
  shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  rand = (min, max) => {
    return min + Math.floor(Math.random() * (1 + max - min));
  };

  positionToSpace = (x) => {
    return 2 * (x - 1) + 1;
  };

  positionToWall = (x) => {
    return 2 * x;
  };

  isGap(...cells) {
    return cells.every((array) => {
      let row, col;
      [row, col] = array;
      if (this.maze[row][col].length > 0) {
        if (!this.maze[row][col].includes("door")) {
          return false;
        }
      }
      return true;
    });
  }

  inBounds(row, col) {
    if (
      typeof this.maze[row] == "undefined" ||
      typeof this.maze[row][col] == "undefined"
    ) {
      return false; // out of bounds
    }
    return true;
  }

  countSteps(array, row, col, val, stop) {
    if (!this.inBounds(row, col)) {
      return false; // out of bounds
    }
    console.log(array[row][col], val);
    if (array[row][col] <= val) {
      console.log("shorter already mapped");
      return false; // shorter route already mapped
    }

    if (!this.isGap([row, col])) {
      return false; // not traversable
    }

    array[row][col] = val;

    console.log("val :", val);

    if (this.maze[row][col].includes(stop)) {
      return true; // reached destination
    }

    this.countSteps(array, row - 1, col, val + 1, stop);
    this.countSteps(array, row, col + 1, val + 1, stop);
    this.countSteps(array, row + 1, col, val + 1, stop);
    this.countSteps(array, row, col - 1, val + 1, stop);
  }

  getQuickestWay = () => {
    let fromEntrance = new Array(this.mazeDimension.rows)
      .fill()
      .map(() => new Array(this.mazeDimension.cols).fill());
    let fromExit = fromEntrance;

    this.totalSteps = -1;

    console.log(fromEntrance);
    for (let j = 1; j < this.mazeDimension.cols - 1; j++) {
      if (this.maze[this.mazeDimension.rows - 1][j].includes("entrance")) {
        this.countSteps(
          fromEntrance,
          this.mazeDimension.rows - 1,
          j,
          0,
          "exit"
        );
      }
      if (this.maze[0][j].includes("exit")) {
        this.countSteps(fromExit, 0, j, 0, "entrance");
      }
    }

    this.maze.map((row, indexRow) => {
      row.map((cell, indexCol) => {
        if (typeof fromEntrance[indexRow][indexCol] == "undefined") {
          return;
        }
        let stepCount =
          fromEntrance[indexRow][indexCol] + fromExit[indexRow][indexCol];
        console.log(stepCount);
        if (stepCount > this.totalSteps) {
          this.totalSteps = stepCount;
        }
      });
    });
  };

  display = (id) => {
    this.parentDiv = document.getElementById(id);

    if (!this.parentDiv) {
      return false;
    }

    while (this.parentDiv.firstChild) {
      this.parentDiv.removeChild(this.parentDiv.firstChild);
    }

    this.getQuickestWay();
    const container = document.createElement("div");
    container.id = "maze";
    container.dataset.steps = this.totalSteps;

    this.maze.map((row) => {
      let rowDiv = document.createElement("div");
      row.map((cell) => {
        let cellDiv = document.createElement("div");
        if (cell) {
          cellDiv.className = cell.join(" ");
        }
        rowDiv.appendChild(cellDiv);
      });
      container.appendChild(rowDiv);
    });

    this.parentDiv.appendChild(container);

    return true;
  };
}
