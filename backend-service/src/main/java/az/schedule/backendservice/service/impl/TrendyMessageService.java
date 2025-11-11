package az.schedule.backendservice.service.impl;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;

@Service
public class TrendyMessageService {

    private static final List<String> START_REMINDERS = List.of(
            "Tới giờ làm task '%s' rồi. Đừng 'bơ' tui nha... :(",
            "Ê bạn ơi, tới giờ làm task '%s' rồi nè, 'ét o ét'!",
            "Task '%s' sắp bắt đầu, đừng để 'deadline' biến thành 'dead'!",
            "Hệ thống ghi nhận task '%s' sắp bắt đầu, 'gét gô' bạn ơi!",
            "Đây là lời nhắc thân thiện cho task '%s'. Thân thiện, lần này thôi. :)",
            "Hình như bạn quên mất task '%s' thì phải? Tui chỉ nhắc 'nhẹ' vậy thôi đó."
    );

    private static final List<String> END_REMINDERS = List.of(
            "Task '%s' sắp tới hạn rồi, 'còn thở là còn gỡ'!",
            "Chỉ còn 10 phút cho task '%s'. 'Ủa alo?' làm nhanh còn đi chill!",
            "Bạn sắp trễ task '%s'. Bạn không muốn biết chuyện gì xảy ra nếu bạn trễ đâu...",
            "Bạn đang 'flex' sự bình tĩnh của mình trước deadline task '%s' hả?",
            "Tui đang nhìn bạn 'chằm chằm' đó. Làm task '%s' lẹ đi. (._. ️)"
    );

    private static final List<String> MOTIVATED_MESSAGE = List.of(
            "Đã xong! Bạn 'slay' task này quá.",
            "Xong việc! Giờ thì 'chill' 5 phút rồi làm tiếp nha. ",
            "Hoàn thành! Task này 'check'. Gét gô task tiếp theo! ",
            "Cháyyyy! Cảm giác 'productive' này nó đã gì đâu.",
            "Không flex nhưng mà... bạn vừa làm quá tốt. Tự hào về bạn!"
    );

    private final Random random = new Random();

    public String getTrendyStartReminder(String taskTitle) {
        String template = START_REMINDERS.get(random.nextInt(START_REMINDERS.size()));
        return String.format(template, taskTitle);
    }

    public String getTrendyEndReminder(String taskTitle) {
        String template = END_REMINDERS.get(random.nextInt(END_REMINDERS.size()));
        return String.format(template, taskTitle);
    }

    public String getTrendyMotivation() {
        return MOTIVATED_MESSAGE.get(random.nextInt(MOTIVATED_MESSAGE.size()));
    }
}
