import React from 'react';
import '../../css/table.css';

function List() {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>タスク名</th>
                        <th>期限</th>
                        <th>状態</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>タスクA</td>
                        <td>2024-11-30</td>
                        <td class="status-done">完了</td>
                        <td>
                            <button>編集</button>
                            <button>削除</button>
                        </td>
                    </tr>
                    <tr>
                        <td>タスクB</td>
                        <td>2024-12-05</td>
                        <td class="status-pending">保留</td>
                    </tr>
                    <tr>
                        <td>タスクC</td>
                        <td>2024-11-20</td>
                        <td class="status-overdue">期限切れ</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default List;
